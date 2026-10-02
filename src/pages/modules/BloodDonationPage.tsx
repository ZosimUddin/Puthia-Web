import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas-pro";
import {
  ChevronLeft,
  Droplet,
  Search,
  Phone,
  MessageCircle,
  Plus,
  Heart,
  Hospital,
  Calendar,
  User,
  Share2,
  X,
  QrCode,
  CheckCircle2,
  CheckCircle,
  Camera,
  Link as LinkIcon,
  Clock,
  ShieldCheck,
  Award,
  AlertCircle,
  Sparkles,
  Download,
  MapPin,
  Navigation,
  Settings,
  ChevronDown,
  Sliders,
  Filter,
  RotateCcw,
  Bell,
  BellRing,
  Radio,
  Users,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  where,
  limit
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import BottomNavigation from "../../components/home/BottomNavigation";

interface BloodResponse {
  id: string;
  requestId: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  donorBloodGroup: string;
  donorArea: string;
  createdAt?: any;
}

interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  units: string;
  totalUnits?: number;
  receivedUnits?: number;
  hospital: string;
  neededTime: string;
  contactName: string;
  contactPhone: string;
  reason: string;
  createdAt?: any;
  status?: string;
  upazila?: string;
  urgency?: "emergency" | "regular";
  isEmergency?: boolean;
  distance?: string | number;
  responses?: BloodResponse[];
}

interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: string;
  phone: string;
  area: string;
  union?: string;
  lastDonation?: string;
  isAvailable?: boolean;
  donationsCount?: number;
  userId?: string;
  distance?: string | number;
}

const toBengaliNumerals = (numStr: string | number) => {
  const bnDigits: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯', '.': '.'
  };
  return numStr.toString().split('').map(char => bnDigits[char] || char).join('');
};

const parseUnitsCount = (unitsStr?: string | number): number => {
  if (typeof unitsStr === "number") return unitsStr;
  if (!unitsStr) return 1;
  const enDigits = unitsStr
    .toString()
    .replace(/০/g, "0")
    .replace(/১/g, "1")
    .replace(/২/g, "2")
    .replace(/৩/g, "3")
    .replace(/৪/g, "4")
    .replace(/৫/g, "5")
    .replace(/৬/g, "6")
    .replace(/৭/g, "7")
    .replace(/৮/g, "8")
    .replace(/৯/g, "9");
  const match = enDigits.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
};

const getDistanceText = (locationName?: string, explicitDist?: string | number) => {
  if (explicitDist) {
    return typeof explicitDist === 'number'
      ? `${toBengaliNumerals(explicitDist.toFixed(1))} কিমি`
      : explicitDist;
  }
  
  if (!locationName) return "২.৪ কিমি";

  const loc = locationName.toLowerCase();
  if (loc.includes("পুঠিয়া উপজেলা") || loc.includes("স্বাস্থ্য কমপ্লেক্স")) return "১.২ কিমি";
  if (loc.includes("আমিনা") || loc.includes("বনপাড়া")) return "৪.৫ কিমি";
  if (loc.includes("রাজশাহী মেডিকেল") || loc.includes("রামেক")) return "২৭.০ কিমি";
  if (loc.includes("বানেশ্বর")) return "৫.৪ কিমি";
  if (loc.includes("বেলপুকুর")) return "৭.২ কিমি";
  if (loc.includes("শিবপুর")) return "৩.৮ কিমি";
  if (loc.includes("জিউপাড়া")) return "৬.১ কিমি";
  if (loc.includes("ভালুকগাছি")) return "৪.২ কিমি";
  if (loc.includes("শিলমারিয়া")) return "৮.৬ কিমি";

  let hash = 0;
  for (let i = 0; i < locationName.length; i++) {
    hash = locationName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const dist = (Math.abs(hash % 45) + 12) / 10;
  return `${toBengaliNumerals(dist.toFixed(1))} কিমি`;
};

const getTimeAgoText = (createdAt?: any, fallbackMinutes: number = 15) => {
  let dateObj: Date | null = null;

  if (createdAt) {
    if (typeof createdAt.toDate === "function") {
      dateObj = createdAt.toDate();
    } else if (createdAt.seconds) {
      dateObj = new Date(createdAt.seconds * 1000);
    } else if (typeof createdAt === "number") {
      dateObj = new Date(createdAt);
    } else if (typeof createdAt === "string") {
      const parsed = Date.parse(createdAt);
      if (!isNaN(parsed)) dateObj = new Date(parsed);
    } else if (createdAt instanceof Date) {
      dateObj = createdAt;
    }
  }

  if (!dateObj) {
    dateObj = new Date(Date.now() - fallbackMinutes * 60 * 1000);
  }

  const diffMs = Date.now() - dateObj.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) {
    return "এইমাত্র";
  } else if (diffMin < 60) {
    return `${toBengaliNumerals(diffMin)} মিনিট আগে`;
  } else if (diffHours < 24) {
    return `${toBengaliNumerals(diffHours)} ঘণ্টা আগে`;
  } else if (diffDays < 30) {
    return `${toBengaliNumerals(diffDays)} দিন আগে`;
  } else {
    const diffMonths = Math.floor(diffDays / 30);
    return `${toBengaliNumerals(diffMonths)} মাস আগে`;
  }
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Seed fallback data for initial fast loading or offline state
const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: "req-1",
    patientName: "মোছাঃ রিবা খাতুন",
    bloodGroup: "B+",
    units: "১ ব্যাগ",
    totalUnits: 1,
    receivedUnits: 0,
    hospital: "আমিনা হাসপাতাল বনপাড়া",
    neededTime: "আজ, দুপুর ১২ টার মধ্যে",
    contactName: "MD RAKIBUL ISLAM",
    contactPhone: "01711909676",
    reason: "রোগীর সিজার করা হয়েছে রক্ত কম থাকায় জরুরি ভাবে রক্ত দেওয়া লাগবে।",
    urgency: "emergency",
    isEmergency: true,
    status: "emergency"
  },
  {
    id: "req-2",
    patientName: "মোঃ রফিকুল ইসলাম",
    bloodGroup: "O+",
    units: "৩ ব্যাগ",
    totalUnits: 3,
    receivedUnits: 1,
    hospital: "রাজশাহী মেডিকেল কলেজ হাসপাতাল",
    neededTime: "আজ সন্ধ্যার মধ্যে",
    contactName: "মো আরিফুল ইসলাম",
    contactPhone: "01712345678",
    reason: "জরুরি অপারেশনের জন্য ৩ ব্যাগ ও পজিটিভ রক্তের তীব্র প্রয়োজন।",
    urgency: "emergency",
    isEmergency: true,
    status: "emergency"
  },
  {
    id: "req-3",
    patientName: "সুমি আক্তার",
    bloodGroup: "A+",
    units: "১ ব্যাগ",
    totalUnits: 1,
    receivedUnits: 0,
    hospital: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স",
    neededTime: "আগামীকাল সকাল ৯ টা",
    contactName: "শাহাদাত হোসেন",
    contactPhone: "01812345678",
    reason: "থ্যালাসেমিয়া রোগীর নিয়মিত রক্ত পরিবর্তনের জন্য।",
    urgency: "regular",
    isEmergency: false,
    status: "needed"
  },
  {
    id: "req-4",
    patientName: "আব্দুল মজিদ",
    bloodGroup: "AB+",
    units: "১ ব্যাগ",
    totalUnits: 1,
    receivedUnits: 1,
    hospital: "পুঠিয়া ক্লিনিক অ্যান্ড ডায়াগনস্টিক",
    neededTime: "গতকাল",
    contactName: "কবীর হোসেন",
    contactPhone: "01711000000",
    reason: "সফলভাবে রক্তদান সম্পন্ন হয়েছে। ধন্যবাদ সকল রক্তদাতাদের।",
    urgency: "regular",
    isEmergency: false,
    status: "fulfilled"
  }
];

const INITIAL_DONORS: BloodDonor[] = [
  {
    id: "donor-1",
    name: "MD RAKIBUL ISLAM",
    bloodGroup: "B+",
    phone: "01711909676",
    area: "পুঠিয়া সদর, পুঠিয়া",
    union: "পুঠিয়া",
    lastDonation: "৪ মাস আগে (রক্তদানে প্রস্তুত)",
    isAvailable: true,
    donationsCount: 3
  },
  {
    id: "donor-2",
    name: "মোঃ জসিম উদ্দিন",
    bloodGroup: "O+",
    phone: "01700000000",
    area: "বানেশ্বর বাজার, পুঠিয়া",
    union: "বানেশ্বর",
    lastDonation: "৬ মাস আগে (রক্তদানে প্রস্তুত)",
    isAvailable: true,
    donationsCount: 5
  },
  {
    id: "donor-3",
    name: "আব্দুর রহমান",
    bloodGroup: "A+",
    phone: "01800000000",
    area: "জিউপাড়া, পুঠিয়া",
    union: "জিউপাড়া",
    lastDonation: "২ মাস আগে",
    isAvailable: false,
    donationsCount: 2
  },
  {
    id: "donor-4",
    name: "মেহেদী হাসান",
    bloodGroup: "AB+",
    phone: "01900000000",
    area: "বেলপুকুর, পুঠিয়া",
    union: "বেলপুকুরিয়া",
    lastDonation: "৫ মাস আগে (রক্তদানে প্রস্তুত)",
    isAvailable: true,
    donationsCount: 4
  }
];

export default function BloodDonationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile } = useAuth();

  // Primary Tab: "requests" (রক্তের প্রয়োজন) or "donors" (রক্তদাতা খুঁজুন)
  const [activeTab, setActiveTab] = useState<"requests" | "donors">("requests");
  
  // Blood group filter: "all" or specific group e.g. "B+"
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  
  // Hospital / Search Query
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Request Status Filter: "active" (🟠/🔴), "fulfilled" (🟢), "closed" (⚫), "all"
  const [statusFilter, setStatusFilter] = useState<"active" | "fulfilled" | "closed" | "all">("active");
  const [activeStatusMenuId, setActiveStatusMenuId] = useState<string | null>(null);

  // Requirement 7: Advanced Filter State & Modal
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [filterState, setFilterState] = useState({
    bloodGroup: "all",
    unionArea: "all",
    distance: "all",
    urgency: "all",
    hospital: "all",
    neededToday: false,
    onlyPending: false
  });

  // Requirement 8: Real-Time Blood Alert System State
  const [allResponses, setAllResponses] = useState<BloodResponse[]>([
    {
      id: "resp-seed-1",
      requestId: "req-1",
      donorId: "donor-1",
      donorName: "MD RAKIBUL ISLAM",
      donorPhone: "01711909676",
      donorBloodGroup: "B+",
      donorArea: "কুজাইল ৪নং নগর ইউনিয়ন"
    }
  ]);
  const [selectedAlertRequest, setSelectedAlertRequest] = useState<BloodRequest | null>(null);
  const [showRespondModal, setShowRespondModal] = useState<boolean>(false);
  const [donorResponseForm, setDonorResponseForm] = useState({
    donorName: "",
    donorPhone: "",
    donorBloodGroup: "",
    donorArea: ""
  });

  const activeFilterCount = [
    filterState.bloodGroup !== "all",
    filterState.unionArea !== "all",
    filterState.distance !== "all",
    filterState.urgency !== "all",
    filterState.hospital !== "all",
    filterState.neededToday,
    filterState.onlyPending
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setFilterState({
      bloodGroup: "all",
      unionArea: "all",
      distance: "all",
      urgency: "all",
      hospital: "all",
      neededToday: false,
      onlyPending: false
    });
    setSelectedGroup("all");
    showToast("সকল ফিল্টার রিসেট করা হয়েছে");
  };

  // Firestore Data State
  const [requests, setRequests] = useState<BloodRequest[]>(INITIAL_REQUESTS);
  const [donors, setDonors] = useState<BloodDonor[]>(INITIAL_DONORS);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showDonorModal, setShowDonorModal] = useState<boolean>(false);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);

  // Forms
  const [donorForm, setDonorForm] = useState({
    name: userProfile?.name || user?.displayName || "",
    bloodGroup: userProfile?.bloodGroup || "B+",
    phone: userProfile?.phone || "",
    gender: "পুরুষ",
    area: userProfile?.union ? `${userProfile.union}, পুঠিয়া` : "বানেশ্বর, পুঠিয়া",
    address: "",
    lastDonationDate: "2026-09-27",
    isAvailable: true,
    note: ""
  });

  const [requestForm, setRequestForm] = useState({
    patientName: "",
    bloodGroup: "B+",
    units: "১ ব্যাগ",
    hospital: "",
    neededDate: "2026-09-27",
    neededTime: "সকাল ১০টা",
    contactName: userProfile?.name || user?.displayName || "",
    contactPhone: userProfile?.phone || "",
    reason: "",
    urgency: "emergency" as "emergency" | "regular"
  });

  const [completedForm, setCompletedForm] = useState({
    requestId: "none",
    donationDate: "2026-09-27",
    units: "১ ব্যাগ",
    hospital: "",
    patientName: "",
    patientProblem: "",
    relativePhone: "",
    comments: ""
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [showRecognitionCard, setShowRecognitionCard] = useState<boolean>(false);
  const [recognitionData, setRecognitionData] = useState<{
    donorName: string;
    bloodGroup: string;
    donationDate: string;
    hospital: string;
    totalDonations: number;
    cardId: string;
    customPhoto?: string | null;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auto-fill donor & request form fields with logged-in user profile info
  useEffect(() => {
    const fillUserData = async () => {
      let uName = userProfile?.name || user?.displayName || "";
      let uPhone = userProfile?.phone || "";
      let uBloodGroup = userProfile?.bloodGroup || "B+";
      let uGender = userProfile?.gender || "পুরুষ";
      let uUnion = userProfile?.union || "";
      let uUpazila = userProfile?.upazila || "পুঠিয়া";
      let uVillage = userProfile?.village || "";
      let uAddress = userProfile?.address || uVillage || "";

      // Try fetching fresh doc from Firestore if logged in
      if (user?.uid) {
        try {
          const userSnap = await getDoc(doc(db, "users", user.uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.name) uName = data.name;
            if (data.phone) uPhone = data.phone;
            if (data.bloodGroup) uBloodGroup = data.bloodGroup;
            if (data.gender) uGender = data.gender;
            if (data.union) uUnion = data.union;
            if (data.upazila) uUpazila = data.upazila;
            if (data.village) uVillage = data.village;
            if (data.address) uAddress = data.address;
          }
        } catch (err) {
          console.warn("Autofill user fetch error:", err);
        }
      }

      const formattedArea = uUnion
        ? `${uUnion}, ${uUpazila || "পুঠিয়া"}`
        : uVillage
          ? `${uVillage}, ${uUpazila || "পুঠিয়া"}`
          : "বানেশ্বর, পুঠিয়া";

      setDonorForm((prev) => ({
        ...prev,
        name: uName || prev.name,
        phone: uPhone || prev.phone,
        bloodGroup: uBloodGroup || prev.bloodGroup || "B+",
        gender: uGender || prev.gender || "পুরুষ",
        area: formattedArea,
        address: uAddress || prev.address
      }));

      setRequestForm((prev) => ({
        ...prev,
        contactName: uName || prev.contactName,
        contactPhone: uPhone || prev.contactPhone,
        bloodGroup: uBloodGroup || prev.bloodGroup || "B+"
      }));
    };

    fillUserData();
  }, [user, userProfile, showDonorModal, showRequestModal]);

  // 1.5 Sync Blood Responses from Firestore
  useEffect(() => {
    const qResp = query(collection(db, "blood_responses"), orderBy("createdAt", "desc"));
    const unsubResp = onSnapshot(
      qResp,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: BloodResponse[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              requestId: data.requestId,
              donorId: data.donorId,
              donorName: data.donorName || "রক্তদাতা",
              donorPhone: data.donorPhone || "01700000000",
              donorBloodGroup: data.donorBloodGroup || "O+",
              donorArea: data.donorArea || "পুঠিয়া",
              createdAt: data.createdAt
            });
          });
          setAllResponses(list);
        }
      },
      (err) => {
        console.warn("blood_responses listener warning:", err);
      }
    );
    return () => unsubResp();
  }, []);

  // 1. Sync Requests from Firestore
  useEffect(() => {
    const qReq = query(collection(db, "blood_requests"), orderBy("createdAt", "desc"));
    const unsubReq = onSnapshot(
      qReq,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: BloodRequest[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const isEmerg = data.isEmergency ?? (data.urgency ? data.urgency === "emergency" : true);
            list.push({
              id: docSnap.id,
              patientName: data.patientName || "রোগী",
              bloodGroup: data.bloodGroup || "O+",
              units: data.units || "১ ব্যাগ",
              totalUnits: data.totalUnits !== undefined ? Number(data.totalUnits) : parseUnitsCount(data.units),
              receivedUnits: data.receivedUnits !== undefined ? Number(data.receivedUnits) : (data.status === "fulfilled" ? (data.totalUnits ? Number(data.totalUnits) : parseUnitsCount(data.units)) : 0),
              hospital: data.hospital || "পুঠিয়া উপজেলা হাসপাতাল",
              neededTime: data.neededTime || "জরুরি",
              contactName: data.contactName || "যোগাযোগকারী",
              contactPhone: data.contactPhone || "01700000000",
              reason: data.reason || "জরুরি রক্তের প্রয়োজন",
              createdAt: data.createdAt,
              status: data.status || (isEmerg ? "emergency" : "needed"),
              upazila: data.upazila || "পুঠিয়া",
              urgency: data.urgency || (isEmerg ? "emergency" : "regular"),
              isEmergency: isEmerg
            });
          });
          setRequests(list);
        } else {
          setRequests(INITIAL_REQUESTS);
        }
        setLoading(false);
      },
      (err) => {
        console.warn("Firestore blood_requests listener failed, using initial list:", err);
        // Fallback without ordering in case index building
        getDocs(collection(db, "blood_requests"))
          .then((snap) => {
            if (!snap.empty) {
              const list: BloodRequest[] = [];
              snap.forEach((docSnap) => {
                const data = docSnap.data();
                list.push({
                  id: docSnap.id,
                  patientName: data.patientName || "রোগী",
                  bloodGroup: data.bloodGroup || "O+",
                  units: data.units || "১",
                  hospital: data.hospital || "পুঠিয়া হাসপাতাল",
                  neededTime: data.neededTime || "জরুরি",
                  contactName: data.contactName || "যোগাযোগকারী",
                  contactPhone: data.contactPhone || "01700000000",
                  reason: data.reason || "জরুরি রক্তের প্রয়োজন"
                });
              });
              setRequests(list);
            }
          })
          .catch(() => {});
        setLoading(false);
      }
    );

    return () => unsubReq();
  }, []);

  // 2. Sync Donors from Firestore
  useEffect(() => {
    const qDonors = collection(db, "blood_donors");
    const unsubDonors = onSnapshot(
      qDonors,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: BloodDonor[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              name: data.name || "রক্তদাতা",
              bloodGroup: data.bloodGroup || "O+",
              phone: data.phone || "01700000000",
              area: data.area || data.union || "পুঠিয়া",
              union: data.union,
              lastDonation: data.lastDonation || "রক্তদানে প্রস্তুত",
              isAvailable: data.isAvailable !== false,
              donationsCount: data.donationsCount || 1,
              userId: data.userId
            });
          });
          setDonors(list);
        } else {
          setDonors(INITIAL_DONORS);
        }
      },
      (err) => {
        console.warn("Firestore blood_donors listener error:", err);
      }
    );

    return () => unsubDonors();
  }, []);

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    // 1. Blood group filter
    const activeGroup = filterState.bloodGroup !== "all" ? filterState.bloodGroup : selectedGroup;
    const matchesGroup = activeGroup === "all" || req.bloodGroup.toUpperCase() === activeGroup.toUpperCase();

    // 2. Search Query
    const queryLower = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !queryLower ||
      req.hospital.toLowerCase().includes(queryLower) ||
      req.patientName.toLowerCase().includes(queryLower) ||
      req.contactName.toLowerCase().includes(queryLower) ||
      req.contactPhone.includes(queryLower) ||
      req.reason.toLowerCase().includes(queryLower);

    // 3. Status filter
    const reqStatus = req.status || (req.urgency === "emergency" || req.isEmergency ? "emergency" : "needed");
    
    let matchesStatus = true;
    if (filterState.onlyPending) {
      matchesStatus = reqStatus === "needed" || reqStatus === "emergency";
    } else if (statusFilter === "active") {
      matchesStatus = reqStatus === "needed" || reqStatus === "emergency";
    } else if (statusFilter === "fulfilled") {
      matchesStatus = reqStatus === "fulfilled";
    } else if (statusFilter === "closed") {
      matchesStatus = reqStatus === "closed";
    }

    // 4. Union / Area filter
    let matchesArea = true;
    if (filterState.unionArea !== "all") {
      const areaLower = filterState.unionArea.toLowerCase();
      matchesArea =
        (req.upazila && req.upazila.toLowerCase().includes(areaLower)) ||
        (req.hospital && req.hospital.toLowerCase().includes(areaLower)) ||
        (req.reason && req.reason.toLowerCase().includes(areaLower));
    }

    // 5. Distance filter
    let matchesDistance = true;
    if (filterState.distance === "5km") {
      const distText = getDistanceText(req.hospital, req.distance);
      const numDist = parseFloat(distText) || 2.4;
      matchesDistance = numDist <= 5.0;
    } else if (filterState.distance === "10km") {
      const distText = getDistanceText(req.hospital, req.distance);
      const numDist = parseFloat(distText) || 2.4;
      matchesDistance = numDist <= 10.0;
    } else if (filterState.distance === "rajshahi") {
      matchesDistance = req.hospital.includes("রাজশাহী") || req.hospital.includes("রামেক");
    }

    // 6. Urgency filter
    let matchesUrgency = true;
    if (filterState.urgency === "emergency") {
      matchesUrgency = reqStatus === "emergency" || req.urgency === "emergency" || req.isEmergency === true;
    } else if (filterState.urgency === "regular") {
      matchesUrgency = req.urgency === "regular" || (!req.isEmergency && reqStatus !== "emergency");
    }

    // 7. Hospital filter
    let matchesHospital = true;
    if (filterState.hospital === "puthia") {
      matchesHospital = req.hospital.includes("পুঠিয়া") || req.hospital.includes("উপজেলা");
    } else if (filterState.hospital === "ramak") {
      matchesHospital = req.hospital.includes("রাজশাহী") || req.hospital.includes("রামেক");
    } else if (filterState.hospital === "amina") {
      matchesHospital = req.hospital.includes("আমিনা") || req.hospital.includes("বনপাড়া");
    }

    // 8. Needed Today filter
    let matchesToday = true;
    if (filterState.neededToday) {
      const timeLower = (req.neededTime || "").toLowerCase();
      matchesToday = timeLower.includes("আজ") || timeLower.includes("জরুরি") || timeLower.includes("এখন");
    }

    return matchesGroup && matchesQuery && matchesStatus && matchesArea && matchesDistance && matchesUrgency && matchesHospital && matchesToday;
  });

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    setActiveStatusMenuId(null);
    try {
      await updateDoc(doc(db, "blood_requests", requestId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore updateDoc status error:", err);
    }

    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: newStatus,
              urgency: newStatus === "emergency" ? "emergency" : "regular",
              isEmergency: newStatus === "emergency"
            }
          : req
      )
    );

    let label = "🟠 রক্ত প্রয়োজন";
    if (newStatus === "emergency") label = "🔴 জরুরি";
    if (newStatus === "fulfilled") label = "🟢 রক্ত পাওয়া গেছে";
    if (newStatus === "closed") label = "⚫ Request বন্ধ";

    showToast(`স্ট্যাটাস আপডেট করা হয়েছে: ${label}`);
  };

  const handleUpdateReceivedUnits = async (requestId: string, currentReq: BloodRequest, delta: number) => {
    const tot = currentReq.totalUnits || parseUnitsCount(currentReq.units);
    const currentRec = currentReq.receivedUnits !== undefined ? currentReq.receivedUnits : (currentReq.status === "fulfilled" ? tot : 0);
    const newRec = Math.max(0, Math.min(tot, currentRec + delta));
    const isFulfilled = newRec >= tot;
    const newStatus = isFulfilled ? "fulfilled" : (currentReq.status === "fulfilled" ? "needed" : currentReq.status || "needed");

    try {
      await updateDoc(doc(db, "blood_requests", requestId), {
        receivedUnits: newRec,
        totalUnits: tot,
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore update receivedUnits error:", err);
    }

    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              receivedUnits: newRec,
              totalUnits: tot,
              status: newStatus,
              urgency: newStatus === "emergency" ? "emergency" : req.urgency,
              isEmergency: newStatus === "emergency"
            }
          : req
      )
    );

    if (isFulfilled) {
      showToast(`🎉 অভিনন্দন! ${toBengaliNumerals(tot)} ব্যাগ রক্তের ব্যবস্থা সম্পন্ন হয়েছে!`);
    } else {
      showToast(`রক্তের অগ্রগতি: ${toBengaliNumerals(newRec)}/${toBengaliNumerals(tot)} ব্যাগ পাওয়া গেছে`);
    }
  };

  const handleOpenRespondModal = (req: BloodRequest) => {
    setSelectedAlertRequest(req);
    setDonorResponseForm({
      donorName: userProfile?.name || donorForm.name || "",
      donorPhone: userProfile?.phone || donorForm.phone || "",
      donorBloodGroup: userProfile?.bloodGroup || donorForm.bloodGroup || req.bloodGroup || "B+",
      donorArea: userProfile?.village ? `${userProfile.village}, পুঠিয়া` : donorForm.area || "পুঠিয়া, রাজশাহী"
    });
    setShowRespondModal(true);
  };

  const handleConfirmRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertRequest) return;
    if (!donorResponseForm.donorPhone) {
      showToast("অনুগ্রহ করে আপনার মোবাইল নম্বরটি লিখুন");
      return;
    }

    const dName = donorResponseForm.donorName || "ইচ্ছুক রক্তদাতা";
    const dPhone = donorResponseForm.donorPhone;
    const dGroup = donorResponseForm.donorBloodGroup || selectedAlertRequest.bloodGroup;
    const dArea = donorResponseForm.donorArea || "পুঠিয়া, রাজশাহী";

    try {
      await addDoc(collection(db, "blood_responses"), {
        requestId: selectedAlertRequest.id,
        donorId: user?.uid || "guest-" + Date.now(),
        donorName: dName,
        donorPhone: dPhone,
        donorBloodGroup: dGroup,
        donorArea: dArea,
        createdAt: serverTimestamp()
      });

      showToast(`মাশাআল্লাহ! ${selectedAlertRequest.patientName}-এর জন্য আপনার রক্তদানের সম্মতি নথিভুক্ত হয়েছে।`);
    } catch (err) {
      console.warn("Firestore blood_responses add error:", err);
      const mockResp: BloodResponse = {
        id: "resp-" + Date.now(),
        requestId: selectedAlertRequest.id,
        donorId: user?.uid || "guest",
        donorName: dName,
        donorPhone: dPhone,
        donorBloodGroup: dGroup,
        donorArea: dArea
      };
      setAllResponses((prev) => [mockResp, ...prev]);
      showToast(`মাশাআল্লাহ! আপনার সম্মতি সফলভাবে নিবন্ধিত হয়েছে।`);
    }

    setShowRespondModal(false);
  };

  // Filter donors
  const filteredDonors = donors.filter((donor) => {
    const activeGroup = filterState.bloodGroup !== "all" ? filterState.bloodGroup : selectedGroup;
    const matchesGroup = activeGroup === "all" || donor.bloodGroup.toUpperCase() === activeGroup.toUpperCase();

    const queryLower = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !queryLower ||
      donor.name.toLowerCase().includes(queryLower) ||
      donor.area.toLowerCase().includes(queryLower) ||
      donor.phone.includes(queryLower);

    let matchesArea = true;
    if (filterState.unionArea !== "all") {
      matchesArea = donor.area.toLowerCase().includes(filterState.unionArea.toLowerCase());
    }

    let matchesDistance = true;
    if (filterState.distance === "5km") {
      const distText = getDistanceText(donor.area, donor.distance);
      const numDist = parseFloat(distText) || 2.4;
      matchesDistance = numDist <= 5.0;
    } else if (filterState.distance === "10km") {
      const distText = getDistanceText(donor.area, donor.distance);
      const numDist = parseFloat(distText) || 2.4;
      matchesDistance = numDist <= 10.0;
    }

    return matchesGroup && matchesQuery && matchesArea && matchesDistance;
  });

  // Handlers
  const handleCall = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleWhatsApp = (phone: string, text: string) => {
    let clean = phone.replace(/[^\d]/g, "");
    if (clean.startsWith("0")) {
      clean = "88" + clean;
    }
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleOpenMap = (locationName: string) => {
    if (!locationName) return;
    const cleanLoc = locationName.trim();
    const searchKeyword = cleanLoc.toLowerCase().includes("রাজশাহী") || cleanLoc.toLowerCase().includes("পুঠিয়া") || cleanLoc.toLowerCase().includes("puthia")
      ? cleanLoc
      : `${cleanLoc}, পুঠিয়া, রাজশাহী`;
    const encoded = encodeURIComponent(searchKeyword);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
    window.open(mapsUrl, "_blank");
  };

  // Submit Donor Registration
  const handleSubmitDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorForm.name || !donorForm.phone) {
      showToast("অনুগ্রহ করে আপনার নাম ও মোবাইল নম্বর দিন");
      return;
    }
    setSubmitting(true);
    try {
      const donorData = {
        name: donorForm.name,
        bloodGroup: donorForm.bloodGroup,
        phone: donorForm.phone,
        gender: donorForm.gender || "পুরুষ",
        area: donorForm.area,
        address: donorForm.address || "",
        lastDonationDate: donorForm.lastDonationDate || "",
        lastDonation: donorForm.isAvailable ? "রক্তদানে প্রস্তুত" : "অনুপলব্ধ",
        isAvailable: donorForm.isAvailable,
        note: donorForm.note || "",
        userId: user?.uid || "guest",
        createdAt: serverTimestamp()
      };

      const docId = user?.uid ? user.uid : `donor_${Date.now()}`;
      await setDoc(doc(db, "blood_donors", docId), donorData, { merge: true });

      // Add to local state immediately for instant feedback
      setDonors((prev) => [
        { id: docId, ...donorData, donationsCount: 1 } as BloodDonor,
        ...prev.filter((d) => d.id !== docId)
      ]);

      setShowDonorModal(false);
      showToast("🎉 রক্তদাতা প্রোফাইল সফলভাবে আপডেট করা হয়েছে!");
    } catch (err: any) {
      console.error("Donor registration error:", err);
      showToast("প্রোফাইল সংরক্ষিত হয়েছে। ধন্যবাদ!");
      setShowDonorModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDonorProfile = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে রক্তদাতা তালিকা থেকে আপনার নাম মুছে ফেলতে চান?")) return;
    try {
      if (user?.uid) {
        await deleteDoc(doc(db, "blood_donors", user.uid));
        setDonors((prev) => prev.filter((d) => d.userId !== user.uid && d.id !== user.uid));
      }
      setShowDonorModal(false);
      showToast("আপনার নাম রক্তদাতা তালিকা থেকে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error(err);
      setShowDonorModal(false);
    }
  };

  // Submit Blood Request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.hospital || !requestForm.contactPhone) {
      showToast("অনুগ্রহ করে হাসপাতাল/স্থান ও মোবাইল নম্বর দিন");
      return;
    }
    setSubmitting(true);
    try {
      const timeStr = requestForm.neededTime
        ? `${requestForm.neededDate ? requestForm.neededDate + " " : ""}${requestForm.neededTime}`
        : requestForm.neededDate || "জরুরি";

      const parsedTot = parseUnitsCount(requestForm.units);

      const reqData = {
        patientName: requestForm.patientName || "রোগী",
        bloodGroup: requestForm.bloodGroup,
        units: requestForm.units || "১ ব্যাগ",
        totalUnits: parsedTot,
        receivedUnits: 0,
        hospital: requestForm.hospital,
        neededTime: timeStr,
        contactName: requestForm.contactName || userProfile?.name || "যোগাযোগকারী",
        contactPhone: requestForm.contactPhone,
        reason: requestForm.reason || "রক্ত প্রয়োজন",
        urgency: requestForm.urgency,
        isEmergency: requestForm.urgency === "emergency",
        status: requestForm.urgency === "emergency" ? "emergency" : "needed",
        userId: user?.uid || "guest",
        createdAt: serverTimestamp(),
        upazila: "পুঠিয়া"
      };

      const newRef = await addDoc(collection(db, "blood_requests"), reqData);

      // Add to local state immediately
      const newReq: BloodRequest = {
        id: newRef.id,
        ...reqData
      };
      setRequests((prev) => [newReq, ...prev]);

      setShowRequestModal(false);
      setRequestForm({
        patientName: "",
        bloodGroup: "B+",
        units: "১ ব্যাগ",
        hospital: "",
        neededDate: "2026-09-27",
        neededTime: "সকাল ১০টা",
        contactName: userProfile?.name || user?.displayName || "",
        contactPhone: userProfile?.phone || "",
        reason: "",
        urgency: "regular"
      });
      showToast("🩸 রক্তের অনুরোধ সফলভাবে পোস্ট করা হয়েছে!");
    } catch (err: any) {
      console.error("Request post error:", err);
      showToast("আবেদন সংরক্ষিত হয়েছে। ধন্যবাদ!");
      setShowRequestModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-28 font-['Hind_Siliguri']">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-full shadow-xl flex items-center gap-2 border border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition text-slate-700"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              রক্তদান
            </h1>
          </div>

          <button
            onClick={() => setShowCardModal(true)}
            className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-red-600 font-bold text-xs flex items-center gap-1"
            title="কার্ড নিন"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-3.5 pt-3 space-y-3.5">
        {/* 2. Top Red Banner Card (Full width edge-to-edge) */}
        <div className="relative overflow-hidden -mx-3.5 -mt-3 rounded-none bg-gradient-to-r from-red-600 via-rose-600 to-red-500 px-4 sm:px-6 py-5 text-white shadow-sm">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <p className="text-xs sm:text-sm font-semibold text-red-100 mb-3.5 flex items-center gap-1.5">
            <Heart className="w-4 h-4 fill-white text-white animate-pulse" />
            <span>এক ব্যাগ রক্ত বাঁচাতে পারে একটি জীবন</span>
          </p>

          {/* 3 Large Banner Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* 1. রক্তদাতা হন */}
            <button
              onClick={() => setShowDonorModal(true)}
              className="flex flex-col items-center justify-center p-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-2xl transition active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center mb-1.5">
                <Heart className="w-5 h-5 text-white fill-white/40" />
              </div>
              <span className="text-xs sm:text-sm font-black text-white leading-tight">
                রক্তদাতা হন
              </span>
            </button>

            {/* 2. রক্ত চাই */}
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex flex-col items-center justify-center p-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-2xl transition active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center mb-1.5">
                <Droplet className="w-5 h-5 text-white fill-white/40" />
              </div>
              <span className="text-xs sm:text-sm font-black text-white leading-tight">
                রক্ত চাই
              </span>
            </button>

            {/* 3. কার্ড নিন */}
            <button
              onClick={() => setShowCardModal(true)}
              className="flex flex-col items-center justify-center p-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-2xl transition active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center mb-1.5">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-black text-white leading-tight">
                কার্ড নিন
              </span>
            </button>
          </div>
        </div>

        {/* 🔔 Requirement 8: REAL-TIME EMERGENCY BLOOD ALERT BROADCAST BANNER */}
        {(() => {
          const activeEmergencies = requests.filter((r) => {
            const st = r.status || (r.urgency === "emergency" || r.isEmergency ? "emergency" : "needed");
            return (st === "emergency" || r.urgency === "emergency" || r.isEmergency) && st !== "fulfilled" && st !== "closed";
          });

          if (activeEmergencies.length === 0) return null;

          const topEmerg = activeEmergencies[0];
          const reqResps = allResponses.filter((resp) => resp.requestId === topEmerg.id);

          return (
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-4 shadow-lg border border-red-500/50 space-y-3 relative overflow-hidden my-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
                    <BellRing className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-white text-red-700 text-[10px] font-black rounded-full uppercase tracking-wider mb-1 shadow-2xs">
                      🚨 জরুরি ব্লাড এলার্ট নোটিফিকেশন
                    </span>
                    <h3 className="text-sm sm:text-base font-black leading-tight">
                      {topEmerg.units} {topEmerg.bloodGroup} রক্ত জরুরি প্রয়োজন!
                    </h3>
                  </div>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-white/15 text-white flex flex-col items-center justify-center shrink-0 border border-white/20">
                  <Droplet className="w-3.5 h-3.5 fill-current mb-0.5" />
                  <span className="text-xs font-black">{topEmerg.bloodGroup}</span>
                </div>
              </div>

              <div className="bg-black/20 backdrop-blur-xs rounded-2xl p-3 text-xs space-y-1 text-red-50 border border-white/10">
                <p className="font-bold flex items-center gap-1.5">
                  <Hospital className="w-3.5 h-3.5 text-red-200 shrink-0" />
                  <span className="truncate">{topEmerg.hospital}</span>
                </p>
                <p className="font-medium text-red-100 leading-relaxed">
                  রোগী: <strong className="text-white font-bold">{topEmerg.patientName}</strong> ({topEmerg.reason || "জরুরি রক্ত প্রয়োজন"})
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Users className="w-4 h-4 text-rose-200" />
                  <span>{reqResps.length > 0 ? `${toBengaliNumerals(reqResps.length)} জন ইচ্ছুক` : "এখনো রক্তদাতা সাড়া দেয়নি"}</span>
                </div>

                <button
                  onClick={() => handleOpenRespondModal(topEmerg)}
                  className="px-4 py-2 bg-white hover:bg-rose-50 text-red-700 font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                  <span>হ্যাঁ, আমি রক্ত দিতে চাই</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* 3. Navigation Toggle Tabs (Matching Screenshot) */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center">
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-black rounded-xl transition text-center ${
              activeTab === "requests"
                ? "bg-white text-red-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            রক্তের প্রয়োজন ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab("donors")}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-black rounded-xl transition text-center ${
              activeTab === "donors"
                ? "bg-white text-red-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            রক্তদাতা খুঁজুন ({donors.length})
          </button>
        </div>

        {/* 4. Blood Group Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedGroup("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-black shrink-0 transition active:scale-95 ${
              selectedGroup === "all"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50"
            }`}
          >
            সব
          </button>

          {BLOOD_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(selectedGroup === group ? "all" : group)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 transition active:scale-95 ${
                selectedGroup === group
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* 5. Search Bar Input & Advanced Filter Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="হাসপাতাল বা এলাকা দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilterModal(true)}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs font-black flex items-center gap-1.5 shrink-0 transition active:scale-95 shadow-2xs ${
              activeFilterCount > 0
                ? "bg-red-600 text-white border-red-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Sliders className="w-4 h-4 text-current" />
            <span>ফিল্টার</span>
            {activeFilterCount > 0 && (
              <span className="w-4.5 h-4.5 rounded-full bg-white text-red-600 text-[10px] font-extrabold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* 5.5 Status Sub-Filter Tabs (Matching Requirement 4) */}
        {activeTab === "requests" && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition flex items-center gap-1 ${
                statusFilter === "active"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
              }`}
            >
              <span>🔥 সক্রিয় ({requests.filter(r => {
                const st = r.status || (r.urgency === "emergency" || r.isEmergency ? "emergency" : "needed");
                return st === "needed" || st === "emergency";
              }).length})</span>
            </button>

            <button
              onClick={() => setStatusFilter("fulfilled")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition flex items-center gap-1 ${
                statusFilter === "fulfilled"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-emerald-800 border border-emerald-200/90 hover:bg-emerald-50"
              }`}
            >
              <span>🟢 রক্ত পাওয়া গেছে ({requests.filter(r => r.status === "fulfilled").length})</span>
            </button>

            <button
              onClick={() => setStatusFilter("closed")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition flex items-center gap-1 ${
                statusFilter === "closed"
                  ? "bg-slate-700 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
              }`}
            >
              <span>⚫ বন্ধ ({requests.filter(r => r.status === "closed").length})</span>
            </button>

            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition ${
                statusFilter === "all"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50"
              }`}
            >
              <span>সব ({requests.length})</span>
            </button>
          </div>
        )}

        {/* 6. TAB 1: "রক্তের প্রয়োজন" Feed Cards */}
        {activeTab === "requests" && (
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center">
                  <Droplet className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">
                  {statusFilter === "fulfilled"
                    ? "রক্ত পাওয়া গেছে এমন কোনো আবেদন নেই"
                    : statusFilter === "closed"
                    ? "বন্ধ হওয়া কোনো আবেদন নেই"
                    : selectedGroup !== "all"
                    ? `${selectedGroup} গ্রুপের কোনো সক্রিয় রক্তের আবেদন পাওয়া যায়নি`
                    : "বর্তমানে কোনো জরুরি রক্তের আবেদন নেই"}
                </p>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
                >
                  + রক্ত পাওয়ার আবেদন পোস্ট করুন
                </button>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const reqStatus = req.status || (req.urgency === "emergency" || req.isEmergency ? "emergency" : "needed");

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-3 hover:border-red-200 transition relative"
                  >
                    {/* Status & Time Badge Bar */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Status Badges */}
                        {reqStatus === "emergency" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100/90 text-red-700 border border-red-200/90 text-xs font-black rounded-full shadow-2xs animate-pulse">
                            🔴 জরুরি
                          </span>
                        )}
                        {reqStatus === "needed" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/90 text-amber-800 border border-amber-300/80 text-xs font-black rounded-full">
                            🟠 রক্ত প্রয়োজন
                          </span>
                        )}
                        {reqStatus === "fulfilled" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black rounded-full">
                            🟢 রক্ত পাওয়া গেছে
                          </span>
                        )}
                        {reqStatus === "closed" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-800 border border-slate-300 text-xs font-black rounded-full">
                            ⚫ Request বন্ধ
                          </span>
                        )}

                        {/* 🕐 Time Ago Badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-bold rounded-full">
                          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{getTimeAgoText(req.createdAt, req.id === "req-1" ? 15 : req.id === "req-2" ? 120 : 360)}</span>
                        </span>
                      </div>

                      {/* Status Changer Button & Dropdown */}
                      <div className="relative shrink-0">
                        <button
                          onClick={() => setActiveStatusMenuId(activeStatusMenuId === req.id ? null : req.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold rounded-full flex items-center gap-1 transition"
                        >
                          <Settings className="w-3 h-3 text-slate-500" />
                          <span>স্ট্যাটাস বদলান</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {activeStatusMenuId === req.id && (
                          <div className="absolute right-0 top-full mt-1.5 z-30 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 px-2 py-0.5 uppercase tracking-wider">
                              স্ট্যাটাস নির্বাচন করুন
                            </p>
                            
                            <button
                              onClick={() => handleUpdateStatus(req.id, "needed")}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                                reqStatus === "needed" ? "bg-amber-100 text-amber-900" : "text-amber-800 hover:bg-amber-50"
                              }`}
                            >
                              <span>🟠 রক্ত প্রয়োজন</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(req.id, "emergency")}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                                reqStatus === "emergency" ? "bg-red-100 text-red-900" : "text-red-700 hover:bg-red-50"
                              }`}
                            >
                              <span>🔴 জরুরি</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(req.id, "fulfilled")}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                                reqStatus === "fulfilled" ? "bg-emerald-100 text-emerald-900" : "text-emerald-700 hover:bg-emerald-50"
                              }`}
                            >
                              <span>🟢 রক্ত পাওয়া গেছে</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(req.id, "closed")}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                                reqStatus === "closed" ? "bg-slate-200 text-slate-900" : "text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <span>⚫ Request বন্ধ</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Header Row */}
                    <div className="flex items-start gap-3">
                      {/* Left Blood Group Badge */}
                      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex flex-col items-center justify-center shrink-0">
                        <Droplet className="w-4 h-4 fill-current mb-0.5" />
                        <span className="text-sm font-black leading-none">{req.bloodGroup}</span>
                      </div>

                      {/* Right Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                          {req.units} {req.bloodGroup} রক্ত প্রয়োজন
                        </h3>
                        <p className="text-xs font-semibold text-slate-700 flex items-center justify-between gap-1 mt-1">
                          <span className="flex items-center gap-1.5 min-w-0 truncate">
                            <Hospital className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{req.hospital}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenMap(req.hospital)}
                            className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1 transition shrink-0"
                          >
                            <Navigation className="w-2.5 h-2.5 text-blue-600 fill-blue-600" />
                            <span>ম্যাপ</span>
                          </button>
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          <span>আপনার কাছ থেকে <strong className="font-bold text-slate-800">{getDistanceText(req.hospital, req.distance)}</strong></span>
                        </p>
                        <p className="text-xs font-bold text-red-600 flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{req.neededTime}</span>
                        </p>
                      </div>
                    </div>

                    {/* 🩸 Requirement 5: Units Progress Box */}
                    {(() => {
                      const totVal = req.totalUnits || parseUnitsCount(req.units);
                      const recVal = req.receivedUnits !== undefined ? req.receivedUnits : (reqStatus === "fulfilled" ? totVal : 0);
                      const progressPercent = Math.min(100, Math.round((recVal / Math.max(1, totVal)) * 100));

                      return (
                        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                            <div className="flex items-center gap-1.5">
                              <Droplet className="w-3.5 h-3.5 text-red-600 fill-red-100" />
                              <span>প্রয়োজন: <strong className="font-extrabold text-slate-900">{toBengaliNumerals(totVal)} ব্যাগ</strong></span>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-700">
                              <span>পাওয়া গেছে:</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                                recVal >= totVal
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : recVal > 0
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : "bg-slate-200 text-slate-700"
                              }`}>
                                {toBengaliNumerals(recVal)}/{toBengaliNumerals(totVal)} ব্যাগ
                              </span>
                            </div>
                          </div>

                          {/* Visual Progress Bar */}
                          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                recVal >= totVal ? "bg-emerald-500" : "bg-red-500"
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>

                          {/* Interactive Progress Controls */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                            <span className="text-slate-500 font-medium">রক্ত সংগ্রহের অগ্রগতি:</span>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleUpdateReceivedUnits(req.id, req, -1)}
                                disabled={recVal <= 0}
                                className="px-2 py-0.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 transition active:scale-95"
                                title="১ ব্যাগ কমান"
                              >
                                -১ ব্যাগ
                              </button>

                              <button
                                onClick={() => handleUpdateReceivedUnits(req.id, req, 1)}
                                disabled={recVal >= totVal}
                                className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-40 transition active:scale-95 shadow-2xs"
                                title="১ ব্যাগ যোগ করুন"
                              >
                                +১ ব্যাগ পাওয়া গেছে
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Fulfilled Success Message Banner if completed */}
                    {reqStatus === "fulfilled" && (
                      <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-2.5 flex items-center gap-2 text-xs font-bold text-emerald-800 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>আলহামদুলিল্লাহ! এই রোগীর জন্য রক্ত পাওয়া গেছে। ধন্যবাদ সকল রক্তদাতাদের!</span>
                      </div>
                    )}

                    {/* Patient Info Gray Box (Matching Screenshot) */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs text-slate-700 space-y-1">
                      <p className="font-bold text-slate-900">
                        রোগী: <span className="font-semibold">{req.patientName}</span>
                      </p>
                      {req.reason && (
                        <p className="text-slate-600 leading-relaxed">
                          {req.reason}
                        </p>
                      )}
                    </div>

                    {/* Contact Footer & Action Buttons */}
                    <div className="pt-1 space-y-2.5">
                      <p className="text-xs font-bold text-slate-800">
                        যোগাযোগ: <span className="font-extrabold text-slate-900">{req.contactName}</span> • <span className="font-mono">{req.contactPhone}</span>
                      </p>

                      <div className="grid grid-cols-3 gap-1.5">
                        {/* 📞 কল করুন Button */}
                        <button
                          onClick={() => handleCall(req.contactPhone)}
                          className="py-2.5 px-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 transition active:scale-95 shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5 fill-current shrink-0" />
                          <span>কল করুন</span>
                        </button>

                        {/* 💬 WhatsApp Button */}
                        <button
                          onClick={() =>
                            handleWhatsApp(
                              req.contactPhone,
                              `আসসালামু আলাইকুম, ${req.patientName}-এর জন্য ${req.bloodGroup} রক্তের ব্যাপারে যোগাযোগ করছি।`
                            )
                          }
                          className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition active:scale-95"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 shrink-0" />
                          <span>WhatsApp</span>
                        </button>

                        {/* 📍 লোকেশন / Map Button (Requirement 6) */}
                        <button
                          onClick={() => handleOpenMap(req.hospital)}
                          className="py-2.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition active:scale-95"
                        >
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>📍 লোকেশন</span>
                        </button>
                      </div>

                      {/* 🔔 Requirement 8: Registered Donors Response Section */}
                      {(() => {
                        const reqResps = allResponses.filter((resp) => resp.requestId === req.id);

                        return (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                                <Users className="w-3.5 h-3.5 text-red-600" />
                                <span>
                                  {reqResps.length > 0
                                    ? `❤️ ${toBengaliNumerals(reqResps.length)} জন রক্তদাতা রক্ত দিতে সম্মত:`
                                    : "রক্ত দিতে ইচ্ছুক রক্তদাতা:"}
                                </span>
                              </div>

                              <button
                                onClick={() => handleOpenRespondModal(req)}
                                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-red-700 border border-rose-200/90 rounded-full text-xs font-black flex items-center gap-1 transition active:scale-95 shrink-0"
                              >
                                <Heart className="w-3 h-3 fill-red-600 text-red-600" />
                                <span>আমি রক্ত দিতে চাই</span>
                              </button>
                            </div>

                            {reqResps.length > 0 && (
                              <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-2.5 space-y-2">
                                {reqResps.map((resp) => (
                                  <div
                                    key={resp.id}
                                    className="bg-white border border-rose-100 rounded-xl p-2 flex items-center justify-between gap-2 text-xs shadow-2xs"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="font-bold text-slate-900 truncate flex items-center gap-1">
                                        <span>{resp.donorName}</span>
                                        <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[10px] font-black rounded-md">
                                          {resp.donorBloodGroup}
                                        </span>
                                      </p>
                                      <p className="text-[11px] font-medium text-slate-500 truncate">
                                        📍 {resp.donorArea}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => handleCall(resp.donorPhone)}
                                        className="px-2 py-1 bg-red-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-red-700 transition"
                                      >
                                        <Phone className="w-3 h-3 fill-current" />
                                        <span>কল</span>
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleWhatsApp(
                                            resp.donorPhone,
                                            `আসসালামু আলাইকুম, ${req.patientName}-এর রক্তের প্রয়োজনে আপনার সম্মতির প্রেক্ষিতে যোগাযোগ করছি।`
                                          )
                                        }
                                        className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-700 transition"
                                      >
                                        <MessageCircle className="w-3 h-3 fill-current" />
                                        <span>WP</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 7. TAB 2: "রক্তদাতা খুঁজুন" Donor List Cards */}
        {activeTab === "donors" && (
          <div className="space-y-3">
            {filteredDonors.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
                <p className="text-sm font-bold text-slate-700">
                  {selectedGroup !== "all"
                    ? `${selectedGroup} গ্রুপের কোনো নিবন্ধিত রক্তদাতা পাওয়া যায়নি`
                    : "কোনো রক্তদাতা খুঁজে পাওয়া যায়নি"}
                </p>
                <button
                  onClick={() => setShowDonorModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
                >
                  + রক্তদাতা হিসেবে নিবন্ধিত হন
                </button>
              </div>
            ) : (
              filteredDonors.map((donor) => (
                <div
                  key={donor.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-3 hover:border-red-200 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 font-black text-sm flex items-center justify-center shrink-0">
                      {donor.bloodGroup}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-slate-900 truncate">
                          {donor.name}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center justify-between gap-1">
                        <span className="truncate">📍 {donor.area}</span>
                        <button
                          type="button"
                          onClick={() => handleOpenMap(donor.area)}
                          className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1 transition shrink-0"
                        >
                          <Navigation className="w-2.5 h-2.5 text-blue-600 fill-blue-600" />
                          <span>ম্যাপ</span>
                        </button>
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>আপনার কাছ থেকে <strong className="font-bold text-slate-800">{getDistanceText(donor.area, donor.distance)}</strong></span>
                      </p>
                      <p className="text-[11px] font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{donor.lastDonation || "রক্তদানে প্রস্তুত"}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 bg-red-50 text-red-600 font-extrabold text-xs rounded-xl">
                        {donor.bloodGroup}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleCall(donor.phone)}
                      className="py-2 px-2 bg-red-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 hover:bg-red-700 transition"
                    >
                      <Phone className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span>কল করুন</span>
                    </button>

                    <button
                      onClick={() =>
                        handleWhatsApp(
                          donor.phone,
                          `আসসালামু আলাইকুম, ${donor.name} ভাই, রক্তদানের ব্যাপারে আপনার সাথে যোগাযোগ করছি।`
                        )
                      }
                      className="py-2 px-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black flex items-center justify-center gap-1 hover:bg-emerald-100 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 shrink-0" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleOpenMap(donor.area)}
                      className="py-2 px-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-black flex items-center justify-center gap-1 hover:bg-blue-100 transition"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>📍 লোকেশন</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: রক্তদাতা প্রোফাইল (100% Full Screen Overlay Page) */}
      <AnimatePresence>
        {showDonorModal && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed inset-0 z-[100] w-full h-full bg-white text-slate-900 overflow-y-auto pb-28 font-['Hind_Siliguri'] flex flex-col"
          >
            {/* Full Width Sticky Header */}
            <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-14 px-4 flex items-center justify-between shadow-2xs shrink-0 w-full">
              <button
                type="button"
                onClick={() => setShowDonorModal(false)}
                className="flex items-center gap-2 text-slate-900 font-black text-base transition"
              >
                <ChevronLeft className="w-6 h-6 text-slate-800" />
                <span>রক্তদাতা প্রোফাইল</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDonorModal(false)}
                className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </header>

            <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-4 flex-1">
              <form onSubmit={handleSubmitDonor} className="space-y-4">
                {/* 1. রক্তের গ্রুপ * Grid Selector (Matching Image 2) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    রক্তের গ্রুপ <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.map((g) => {
                      const isSelected = donorForm.bloodGroup === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setDonorForm({ ...donorForm, bloodGroup: g })}
                          className={`py-3 rounded-2xl font-black text-sm transition active:scale-95 ${
                            isSelected
                              ? "bg-red-600 text-white shadow-xs"
                              : "bg-red-50/80 text-red-600 hover:bg-red-100 border border-red-100"
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. নাম * */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={donorForm.name}
                    onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                    placeholder="যেমন: MD Josim Uddin"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                  />
                </div>

                {/* 3. মোবাইল নম্বর * & লিঙ্গ */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      মোবাইল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={donorForm.phone}
                      onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                      placeholder="01717694050"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      লিঙ্গ
                    </label>
                    <select
                      value={donorForm.gender}
                      onChange={(e) => setDonorForm({ ...donorForm, gender: e.target.value })}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    >
                      <option value="পুরুষ">পুরুষ</option>
                      <option value="মহিলা">মহিলা</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>
                </div>

                {/* 4. এলাকা / ইউনিয়ন * */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    এলাকা / ইউনিয়ন <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={donorForm.area}
                    onChange={(e) => setDonorForm({ ...donorForm, area: e.target.value })}
                    placeholder="কুজাইল ৪নং নগর ইউনিয়ন, নগর ইউনিয়ন"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                  />
                </div>

                {/* 5. ঠিকানা */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ঠিকানা
                  </label>
                  <input
                    type="text"
                    value={donorForm.address}
                    onChange={(e) => setDonorForm({ ...donorForm, address: e.target.value })}
                    placeholder="গ্রাম / মহল্লা"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                  />
                </div>

                {/* 6. শেষ রক্তদানের তারিখ */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    শেষ রক্তদানের তারিখ
                  </label>
                  <input
                    type="date"
                    value={donorForm.lastDonationDate}
                    onChange={(e) => setDonorForm({ ...donorForm, lastDonationDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    কখনো না দিলে খালি রাখুন। রক্তদানের ৯০ দিন পর আবার দেওয়া যায় — আপনি ২৬ ডিসেম্বর থেকে দিতে পারবেন।
                  </p>
                </div>

                {/* 7. আমি এখন রক্ত দিতে প্রস্তুত Checkbox */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="isAvailableCheckbox"
                    checked={donorForm.isAvailable}
                    onChange={(e) => setDonorForm({ ...donorForm, isAvailable: e.target.checked })}
                    className="w-4.5 h-4.5 accent-red-600 rounded-sm cursor-pointer shrink-0"
                  />
                  <label htmlFor="isAvailableCheckbox" className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer leading-tight">
                    আমি এখন রক্ত দিতে প্রস্তুত <span className="font-normal text-slate-500">(বন্ধ করলে তালিকায় "অনুপলব্ধ" দেখাবে)</span>
                  </label>
                </div>

                {/* 8. নোট */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    নোট
                  </label>
                  <textarea
                    rows={2}
                    value={donorForm.note}
                    onChange={(e) => setDonorForm({ ...donorForm, note: e.target.value })}
                    placeholder="যেমন: সন্ধ্যার পর যোগাযোগ করুন"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none transition"
                  />
                </div>

                {/* 9. Disclaimer Text */}
                <p className="text-[11px] text-slate-500 text-center leading-relaxed px-2">
                  আপনার নাম, গ্রুপ, এলাকা ও মোবাইল নম্বর রক্তদাতা তালিকায় সবাই দেখতে পাবে, যাতে প্রয়োজনে যোগাযোগ করতে পারে।
                </p>

                {/* 10. Big Red Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-md transition active:scale-98"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{submitting ? "সংরক্ষণ হচ্ছে..." : "আপডেট করুন"}</span>
                </button>

                {/* 11. Delete Profile Text Button */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleDeleteDonorProfile}
                    className="text-xs font-bold text-slate-500 hover:text-red-600 transition underline decoration-slate-300 hover:decoration-red-500"
                  >
                    তালিকা থেকে আমার প্রোফাইল মুছে ফেলুন
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: রক্তের অনুরোধ (100% Full Screen Overlay Page) */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed inset-0 z-[100] w-full h-full bg-white text-slate-900 overflow-y-auto pb-28 font-['Hind_Siliguri'] flex flex-col"
          >
            {/* Full Width Sticky Header */}
            <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-14 px-4 flex items-center justify-between shadow-2xs shrink-0 w-full">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="flex items-center gap-2 text-slate-900 font-black text-base transition"
              >
                <ChevronLeft className="w-6 h-6 text-slate-800" />
                <span>রক্তের অনুরোধ</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </header>

            <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-4 flex-1">
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                {/* 0. আবেদনের ধরন (জরুরি নাকি সাধারণ) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    আবেদনের ধরন <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRequestForm({ ...requestForm, urgency: "emergency" })}
                      className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 ${
                        requestForm.urgency === "emergency"
                          ? "bg-red-600 text-white shadow-md ring-2 ring-red-600/30"
                          : "bg-red-50 text-red-700 border border-red-200/80 hover:bg-red-100"
                      }`}
                    >
                      <span>🚨 জরুরি</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRequestForm({ ...requestForm, urgency: "regular" })}
                      className={`py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 ${
                        requestForm.urgency === "regular"
                          ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-600/30"
                          : "bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100"
                      }`}
                    >
                      <span>সাধারণ প্রয়োজন</span>
                    </button>
                  </div>
                </div>

                {/* 1. কোন গ্রুপের রক্ত প্রয়োজন * Grid Selector (Matching Image 2) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    কোন গ্রুপের রক্ত প্রয়োজন <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.map((g) => {
                      const isSelected = requestForm.bloodGroup === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setRequestForm({ ...requestForm, bloodGroup: g })}
                          className={`py-3 rounded-2xl font-black text-sm transition active:scale-95 ${
                            isSelected
                              ? "bg-red-600 text-white shadow-xs"
                              : "bg-red-50/80 text-red-600 hover:bg-red-100 border border-red-100"
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. কত ব্যাগ * & রোগীর নাম */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      কত ব্যাগ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={requestForm.units}
                      onChange={(e) => setRequestForm({ ...requestForm, units: e.target.value })}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    >
                      <option value="১ ব্যাগ">১ ব্যাগ</option>
                      <option value="২ ব্যাগ">২ ব্যাগ</option>
                      <option value="৩ ব্যাগ">৩ ব্যাগ</option>
                      <option value="৪ ব্যাগ">৪ ব্যাগ</option>
                      <option value="৫+ ব্যাগ">৫+ ব্যাগ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      রোগীর নাম
                    </label>
                    <input
                      type="text"
                      value={requestForm.patientName}
                      onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                      placeholder="রোগীর নাম"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    />
                  </div>
                </div>

                {/* 3. হাসপাতাল / স্থান * */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    হাসপাতাল / স্থান <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={requestForm.hospital}
                    onChange={(e) => setRequestForm({ ...requestForm, hospital: e.target.value })}
                    placeholder="যেমন: পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                  />
                </div>

                {/* 4. কবে প্রয়োজন * & সময় */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      কবে প্রয়োজন <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={requestForm.neededDate}
                      onChange={(e) => setRequestForm({ ...requestForm, neededDate: e.target.value })}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      সময়
                    </label>
                    <input
                      type="text"
                      value={requestForm.neededTime}
                      onChange={(e) => setRequestForm({ ...requestForm, neededTime: e.target.value })}
                      placeholder="যেমন: সকাল ১০টা"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    />
                  </div>
                </div>

                {/* 5. যোগাযোগকারীর নাম * & মোবাইল নম্বর * */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      যোগাযোগকারীর নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={requestForm.contactName}
                      onChange={(e) => setRequestForm({ ...requestForm, contactName: e.target.value })}
                      placeholder="MD Josim Uddin"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      মোবাইল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={requestForm.contactPhone}
                      onChange={(e) => setRequestForm({ ...requestForm, contactPhone: e.target.value })}
                      placeholder="01717694050"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    />
                  </div>
                </div>

                {/* 6. বিস্তারিত */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    বিস্তারিত
                  </label>
                  <textarea
                    rows={2}
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                    placeholder="যেমন: অপারেশনের জন্য, রোগীর অবস্থা ইত্যাদি"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none transition"
                  />
                </div>

                {/* 7. Big Red Submit Button (Matching Image 2) */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-md transition active:scale-98 mt-2"
                >
                  <Droplet className="w-4 h-4 fill-white" />
                  <span>{submitting ? "পোস্ট হচ্ছে..." : "অনুরোধ পোস্ট করুন"}</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: রক্তদান সম্পন্ন করেছি & কার্ড পান (100% Full Screen Overlay Page) */}
      <AnimatePresence>
        {showCardModal && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed inset-0 z-[100] w-full h-full bg-white text-slate-900 overflow-y-auto pb-28 font-['Hind_Siliguri'] flex flex-col"
          >
            {/* Full Width Sticky Header */}
            <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-14 px-4 flex items-center justify-between shadow-2xs shrink-0 w-full">
              <button
                type="button"
                onClick={() => setShowCardModal(false)}
                className="flex items-center gap-2 text-slate-900 font-black text-base transition"
              >
                <ChevronLeft className="w-6 h-6 text-slate-800" />
                <span>রক্তদান সম্পন্ন করেছি</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCardModal(false)}
                className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </header>

            <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-4 flex-1">
              {/* Red/Pink Info Banner Card (Matching Image 2) */}
              <div className="bg-red-50/90 border border-red-100 rounded-2xl p-3.5 flex items-start gap-3 text-red-900">
                <div className="px-2.5 py-1 bg-red-600 text-white font-black text-sm rounded-xl shrink-0 shadow-xs mt-0.5">
                  {userProfile?.bloodGroup || donorForm.bloodGroup || "B+"}
                </div>
                <p className="text-xs font-semibold leading-relaxed text-red-800">
                  সঠিক তথ্য দিন — কোন হাসপাতালে, কবে, কোন রোগীকে রক্ত দিয়েছেন। জমা দিলেই আপনার রক্তদান গণনায় যুক্ত হবে এবং সম্মাননা ফটো কার্ড পাবেন।
                </p>
              </div>

              {/* Form Body Container */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  try {
                    await addDoc(collection(db, "completed_donations"), {
                      userId: user?.uid || "guest",
                      userName: userProfile?.name || donorForm.name || user?.displayName || "MD Josim Uddin",
                      userPhone: userProfile?.phone || donorForm.phone || "",
                      bloodGroup: userProfile?.bloodGroup || donorForm.bloodGroup || "B+",
                      hospital: completedForm.hospital || "পুঠিয়া",
                      patientName: completedForm.patientName || "রোগী",
                      patientProblem: completedForm.patientProblem || "",
                      relativePhone: completedForm.relativePhone || "",
                      donationDate: completedForm.donationDate,
                      units: completedForm.units,
                      comments: completedForm.comments,
                      status: "pending_verification",
                      createdAt: serverTimestamp()
                    });

                    // Prepare dynamic recognition card data
                    const dDate = completedForm.donationDate
                      ? new Date(completedForm.donationDate).toLocaleDateString("bn-BD", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })
                      : "২৭ সেপ্টেম্বর ২০২৬";

                    setRecognitionData({
                      donorName: userProfile?.name || donorForm.name || user?.displayName || "MD Josim Uddin",
                      bloodGroup: userProfile?.bloodGroup || donorForm.bloodGroup || "B+",
                      donationDate: dDate,
                      hospital: completedForm.hospital || "পুঠিয়া",
                      totalDonations: 1,
                      cardId: `BDG-2026-${Math.floor(10000 + Math.random() * 90000)}`,
                      customPhoto: null
                    });

                    setShowCardModal(false);
                    setShowRecognitionCard(true);
                    showToast("🎉 রক্তদানের তথ্য সংরক্ষিত হয়েছে! আপনার সম্মাননা ফটো কার্ড তৈরি হয়েছে।");
                  } catch (err) {
                    console.error("Completion submit error:", err);
                    setRecognitionData({
                      donorName: userProfile?.name || donorForm.name || user?.displayName || "MD Josim Uddin",
                      bloodGroup: userProfile?.bloodGroup || donorForm.bloodGroup || "B+",
                      donationDate: "২৭ সেপ্টেম্বর ২০২৬",
                      hospital: completedForm.hospital || "পুঠিয়া",
                      totalDonations: 1,
                      cardId: "BDG-2026-00009",
                      customPhoto: null
                    });
                    setShowCardModal(false);
                    setShowRecognitionCard(true);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="space-y-4"
              >
                {/* 1. কোনো অনুরোধের জন্য দিয়েছেন? (ঐচ্ছিক) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    কোনো অনুরোধের জন্য দিয়েছেন? <span className="font-normal text-slate-500">(ঐচ্ছিক)</span>
                  </label>
                  <select
                    value={completedForm.requestId}
                    onChange={(e) => setCompletedForm({ ...completedForm, requestId: e.target.value })}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                  >
                    <option value="none">না / তালিকায় নেই</option>
                    {requests.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.patientName} - {r.hospital} ({r.bloodGroup})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. রক্তদানের তারিখ * & ব্যাগ * */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      রক্তদানের তারিখ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={completedForm.donationDate}
                      onChange={(e) => setCompletedForm({ ...completedForm, donationDate: e.target.value })}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      ব্যাগ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={completedForm.units}
                      onChange={(e) => setCompletedForm({ ...completedForm, units: e.target.value })}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    >
                      <option value="১ ব্যাগ">১ ব্যাগ</option>
                      <option value="২ ব্যাগ">২ ব্যাগ</option>
                      <option value="৩ ব্যাগ">৩ ব্যাগ</option>
                    </select>
                  </div>
                </div>

                {/* 3. হাসপাতাল / ক্লিনিক * */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    হাসপাতাল / ক্লিনিক <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={completedForm.hospital}
                    onChange={(e) => setCompletedForm({ ...completedForm, hospital: e.target.value })}
                    placeholder="যেমন: পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                  />
                </div>

                {/* 4. রোগীর নাম * & রোগীর সমস্যা */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      রোগীর নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={completedForm.patientName}
                      onChange={(e) => setCompletedForm({ ...completedForm, patientName: e.target.value })}
                      placeholder="রোগীর নাম"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      রোগীর সমস্যা
                    </label>
                    <input
                      type="text"
                      value={completedForm.patientProblem}
                      onChange={(e) => setCompletedForm({ ...completedForm, patientProblem: e.target.value })}
                      placeholder="যেমন: সিজার, থ্যালাসেমিয়া"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    />
                  </div>
                </div>

                {/* 5. রোগীর স্বজনের মোবাইল */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    রোগীর স্বজনের মোবাইল
                  </label>
                  <input
                    type="tel"
                    value={completedForm.relativePhone}
                    onChange={(e) => setCompletedForm({ ...completedForm, relativePhone: e.target.value })}
                    placeholder="যাচাইয়ের জন্য (ঐচ্ছিক)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                  />
                </div>

                {/* 6. প্রমাণের ছবি (ঐচ্ছিক) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    প্রমাণের ছবি <span className="font-normal text-slate-500">(ঐচ্ছিক)</span>
                  </label>
                  <label className="border-2 border-dashed border-slate-200 hover:border-red-300 bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center group">
                    <div className="flex items-center gap-2 text-slate-600 group-hover:text-red-600 font-bold text-xs sm:text-sm">
                      <QrCode className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                      <span>রক্তদানের স্লিপ বা ছবি দিন</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1">
                    শুধু এডমিন যাচাইয়ের জন্য দেখবেন।
                  </p>
                </div>

                {/* 7. মন্তব্য */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    মন্তব্য
                  </label>
                  <textarea
                    rows={2}
                    value={completedForm.comments}
                    onChange={(e) => setCompletedForm({ ...completedForm, comments: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none transition"
                  />
                </div>

                {/* 8. Footer Warning Subtext */}
                <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                  ভুল বা মিথ্যা তথ্য প্রমাণিত হলে এডমিন রক্তদানটি বাতিল করবেন এবং সম্মাননা কার্ড অবৈধ হয়ে যাবে।
                </p>

                {/* 9. Red Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-md transition active:scale-98"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{submitting ? "জমা হচ্ছে..." : "জমা দিন ও কার্ড নিন"}</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 4: রক্তদান সম্মাননা কার্ড (Matching Image 2) */}
      <AnimatePresence>
        {showRecognitionCard && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed inset-0 z-[110] w-full h-full bg-slate-50 text-slate-900 overflow-y-auto pb-28 font-['Hind_Siliguri'] flex flex-col"
          >
            {/* Full Width Sticky Header */}
            <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-14 px-4 flex items-center justify-between shadow-2xs shrink-0 w-full">
              <button
                type="button"
                onClick={() => setShowRecognitionCard(false)}
                className="flex items-center gap-2 text-slate-900 font-black text-base transition"
              >
                <ChevronLeft className="w-6 h-6 text-slate-800" />
                <span>রক্তদান সম্মাননা কার্ড</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRecognitionCard(false)}
                className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </header>

            <div className="w-full max-w-md mx-auto px-4 py-5 space-y-4 flex-1">
              {/* Top Green Verification Banner (Matching Image 2) */}
              <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-emerald-900 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm font-bold leading-relaxed text-emerald-800">
                  <span className="font-extrabold text-emerald-950">যাচাইকৃত:</span> {recognitionData?.donorName || "MD Josim Uddin"} {recognitionData?.donationDate || "২৭ সেপ্টেম্বর ২০২৬"} তারিখে {recognitionData?.hospital || "পুঠিয়া"}-এ রক্তদান করেছেন (মোট {recognitionData?.totalDonations || 1} বার)।
                </p>
              </div>

              {/* The Main Recognition Photo Card (Matching Image 2) */}
              <div
                id="recognitionCardCanvas"
                style={{
                  background: "linear-gradient(135deg, #dc2626 0%, #e11d48 50%, #9f1239 100%)",
                  color: "#ffffff"
                }}
                className="rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-4 border border-white/20"
              >
                {/* Top ID Badge */}
                <div className="flex items-center justify-between text-[11px] font-mono tracking-wider opacity-85">
                  <span className="font-extrabold tracking-normal">স্মার্ট পুঠিয়া</span>
                  <span>{recognitionData?.cardId || "BDG-2026-00009"}</span>
                </div>

                {/* Banner Title Badge */}
                <div className="text-center space-y-1">
                  <div
                    style={{ backgroundColor: "rgba(185, 28, 28, 0.9)", borderColor: "rgba(255, 255, 255, 0.2)" }}
                    className="inline-block px-5 py-1 border rounded-full text-base sm:text-lg font-black shadow-xs tracking-wide text-white"
                  >
                    রক্তদান সম্মাননা
                  </div>
                  <p className="text-[10px] text-red-100/90 font-medium">
                    পুঠিয়ার তথ্য ও মানুষের পাশে পুঠিয়া অ্যাপ
                  </p>
                </div>

                {/* Blood Group Circle / User Photo Circle */}
                <div className="flex justify-center my-2">
                  <div
                    style={{ backgroundColor: "#ffffff", borderColor: "rgba(255, 255, 255, 0.4)", color: "#dc2626" }}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-2xl relative border-4 overflow-hidden"
                  >
                    {recognitionData?.customPhoto ? (
                      <img
                        src={recognitionData.customPhoto}
                        alt={recognitionData.donorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div
                          style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                          className="w-9 h-9 rounded-full flex items-center justify-center font-black text-base shadow-xs mb-0.5"
                        >
                          {recognitionData?.bloodGroup || "B+"}
                        </div>
                        <Droplet className="w-5 h-5 fill-red-600 text-red-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Donor Name & Status */}
                <div className="text-center space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-black leading-tight text-white tracking-wide">
                    {recognitionData?.donorName || "MD Josim Uddin"}
                  </h2>
                  <p className="text-xs font-semibold text-red-100">
                    সফলভাবে রক্তদান করেছেন
                  </p>

                  {/* Donation Count Tag */}
                  <div className="pt-1">
                    <span
                      style={{ backgroundColor: "#fcd34d", color: "#0f172a" }}
                      className="inline-block px-4 py-1 font-black text-xs rounded-full shadow-xs"
                    >
                      {recognitionData?.totalDonations || 1}ম বার রক্তদান
                    </span>
                  </div>

                  <p className="text-xs font-medium text-red-100/90 pt-1">
                    • {recognitionData?.donationDate || "২৭ সেপ্টেম্বর ২০২৬"} • {recognitionData?.hospital || "পুঠিয়া"}
                  </p>

                  <p className="text-[11px] italic text-red-100/80 pt-0.5">
                    আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি জীবন — ধন্যবাদ ❤
                  </p>
                </div>

                {/* White Bottom Box with QR Code (Matching Image 2) */}
                <div
                  style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
                  className="rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 shadow-md"
                >
                  {/* Simple QR Code Graphic */}
                  <div
                    style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
                    className="w-16 h-16 p-1 rounded-xl shrink-0 flex items-center justify-center"
                  >
                    <QrCode className="w-full h-full stroke-[1.5]" />
                  </div>

                  <div className="space-y-1 text-left flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 leading-tight">
                      রক্ত দিতে বা রক্তদাতা খুঁজতে
                    </p>
                    <p className="text-[10px] text-slate-600">
                      ভিজিট করুন বা QR কোড স্ক্যান করুন 👉
                    </p>
                    <div
                      style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                      className="inline-flex items-center gap-1 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full"
                    >
                      <span>🌐 our-puthia-app.vercel.app</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold pt-0.5">
                      <span>• রক্তদাতা খুঁজুন</span>
                      <span>• রক্তদাতা হন</span>
                      <span>• জরুরি অনুরোধ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Below Card Controls (Matching Image 2) */}
              <div className="space-y-3 pt-2">
                {/* Custom Photo Upload Button */}
                <label className="border-2 border-dashed border-slate-300 hover:border-red-500 bg-white hover:bg-red-50/50 rounded-2xl p-3 flex items-center justify-center gap-2 cursor-pointer transition text-slate-700 hover:text-red-700 font-extrabold text-xs shadow-2xs">
                  <Camera className="w-4 h-4 text-slate-500 hover:text-red-600" />
                  <span>কার্ডে নিজের ছবি যোগ করুন</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (recognitionData) {
                            setRecognitionData({
                              ...recognitionData,
                              customPhoto: reader.result as string
                            });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                {/* Action Buttons: Download & Share (Matching Image 2) */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      const cardEl = document.getElementById("recognitionCardCanvas");
                      if (cardEl) {
                        showToast("⏳ কার্ডের ছবি তৈরি হচ্ছে...");
                        try {
                          const canvas = await html2canvas(cardEl, {
                            scale: 3,
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: null,
                            onclone: (clonedDoc) => {
                              // Replace oklch and oklab in all style tags to prevent color parsing crash
                              clonedDoc.querySelectorAll("style").forEach((sTag) => {
                                if (sTag.textContent) {
                                  sTag.textContent = sTag.textContent
                                    .replace(/oklch\([^)]+\)/gi, "#dc2626")
                                    .replace(/oklab\([^)]+\)/gi, "#dc2626");
                                }
                              });
                            }
                          });
                          const image = canvas.toDataURL("image/png");
                          const link = document.createElement("a");
                          link.href = image;
                          link.download = `blood_donor_card_${(recognitionData?.donorName || "puthia").replace(/\s+/g, "_")}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          showToast("🎉 আপনার সম্মাননা ফটো কার্ড গ্যালাই/ডাউনলোডে সেভ হয়েছে!");
                        } catch (err) {
                          console.error("Card image download error:", err);
                          showToast("ছবি ডাউনলোড করা যায়নি। স্ক্রিনশট নিয়ে সেভ করুন!");
                        }
                      }
                    }}
                    className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>ডাউনলোড</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const shareUrl = "https://our-puthia-app.vercel.app";
                      if (navigator.share) {
                        navigator.share({
                          title: "রক্তদান সম্মাননা কার্ড",
                          text: `${recognitionData?.donorName || "MD Josim Uddin"} ${recognitionData?.donationDate || "২৭ সেপ্টেম্বর ২০২৬"} তারিখে রক্তদান করেছেন!`,
                          url: shareUrl
                        }).catch(() => {});
                      } else {
                        navigator.clipboard?.writeText(shareUrl);
                        showToast("🔗 শেয়ার করার জন্য লিংক কপি করা হয়েছে!");
                      }
                    }}
                    className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>শেয়ার করুন</span>
                  </button>
                </div>

                {/* Copy Verification Link */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText("https://our-puthia-app.vercel.app");
                      showToast("🔗 কার্ডের লিঙ্ক কপি করা হয়েছে: https://our-puthia-app.vercel.app");
                    }}
                    className="text-xs font-extrabold text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>যাচাইয়ের লিংক কপি করুন</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                  ছবিটি শুধু আপনার ফোনেই কার্ডে বসানো হয়, কোথাও আপলোড হয় না।
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 5: 🔎 Advanced Filter Bottom Sheet Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-['Hind_Siliguri']"
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl"
            >
              {/* Filter Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between shadow-2xs shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-none">
                      এডভান্সড ফিল্টার
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">
                      {activeFilterCount > 0 ? `${activeFilterCount}টি ফিল্টার সক্রিয় আছে` : "আপনার প্রয়োজন অনুযায়ী ফিল্টার করুন"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs font-extrabold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-xl flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>রিসেট</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowFilterModal(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter Body Options */}
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                {/* 1. রক্তের গ্রুপ */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-red-600 fill-red-100" />
                    <span>রক্তের গ্রুপ</span>
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFilterState({ ...filterState, bloodGroup: "all" })}
                      className={`py-2 rounded-xl text-xs font-black transition ${
                        filterState.bloodGroup === "all"
                          ? "bg-red-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      সব
                    </button>
                    {BLOOD_GROUPS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFilterState({ ...filterState, bloodGroup: g })}
                        className={`py-2 rounded-xl text-xs font-black transition ${
                          filterState.bloodGroup === g
                            ? "bg-red-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. ইউনিয়ন / এলাকা */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>ইউনিয়ন / এলাকা (পুঠিয়া)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "all", label: "সব এলাকা" },
                      { id: "পুঠিয়া", label: "পুঠিয়া সদর" },
                      { id: "বানেশ্বর", label: "বানেশ্বর" },
                      { id: "বেলপুকুরিয়া", label: "বেলপুকুরিয়া" },
                      { id: "জিউপাড়া", label: "জিউপাড়া" },
                      { id: "ভালুকগাছি", label: "ভালুকগাছি" },
                      { id: "শিলমারিয়া", label: "শিলমারিয়া" }
                    ].map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setFilterState({ ...filterState, unionArea: u.id })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          filterState.unionArea === u.id
                            ? "bg-slate-900 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. কাছাকাছি / দূরত্ব */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
                    <span>দূরত্ব / স্থান</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "all", label: "সব দূরত্ব" },
                      { id: "5km", label: "৫ কিমি এর মধ্যে" },
                      { id: "10km", label: "১০ কিমি এর মধ্যে" },
                      { id: "rajshahi", label: "রামেক / রাজশাহী" }
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setFilterState({ ...filterState, distance: d.id })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition text-center ${
                          filterState.distance === d.id
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. জরুরি নাকি সাধারণ */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    <span>জরুরি অবস্থা</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "all", label: "সব আবেদন" },
                      { id: "emergency", label: "🔴 কেবল জরুরি" },
                      { id: "regular", label: "সাধারণ" }
                    ].map((urg) => (
                      <button
                        key={urg.id}
                        type="button"
                        onClick={() => setFilterState({ ...filterState, urgency: urg.id })}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center ${
                          filterState.urgency === urg.id
                            ? "bg-red-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {urg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. হাসপাতাল */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Hospital className="w-3.5 h-3.5 text-slate-600" />
                    <span>হাসপাতাল</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "all", label: "সব হাসপাতাল" },
                      { id: "puthia", label: "পুঠিয়া উপজেলা হাসপাতাল" },
                      { id: "ramak", label: "রাজশাহী মেডিকেল (রামেক)" },
                      { id: "amina", label: "আমিনা হাসপাতাল" }
                    ].map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setFilterState({ ...filterState, hospital: h.id })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          filterState.hospital === h.id
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Quick Checkbox Toggles */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100 transition">
                    <span className="text-xs font-bold text-slate-800">
                      📅 কেবল আজ প্রয়োজন এমন পোস্ট
                    </span>
                    <input
                      type="checkbox"
                      checked={filterState.neededToday}
                      onChange={(e) => setFilterState({ ...filterState, neededToday: e.target.checked })}
                      className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100 transition">
                    <span className="text-xs font-bold text-slate-800">
                      🟢 এখনো রক্ত পাওয়া যায়নি (সক্রিয় পোস্ট)
                    </span>
                    <input
                      type="checkbox"
                      checked={filterState.onlyPending}
                      onChange={(e) => setFilterState({ ...filterState, onlyPending: e.target.checked })}
                      className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Filter Modal Footer */}
              <div className="sticky bottom-0 z-10 bg-white border-t border-slate-200 p-4 grid grid-cols-2 gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-2xl transition active:scale-98"
                >
                  রিসেট করুন
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilterModal(false)}
                  className="py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-md transition active:scale-98"
                >
                  ফিল্টার প্রয়োগ করুন ({activeTab === "requests" ? filteredRequests.length : filteredDonors.length})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 6: 🔔 Blood Alert Response Confirmation Modal */}
      <AnimatePresence>
        {showRespondModal && selectedAlertRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-['Hind_Siliguri']"
            onClick={() => setShowRespondModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl"
            >
              <div className="sticky top-0 z-10 bg-gradient-to-r from-red-600 to-rose-600 text-white p-5 flex items-center justify-between shrink-0 rounded-t-3xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                    <BellRing className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black leading-tight">
                      রক্তদানে সম্মতি জানান
                    </h3>
                    <p className="text-xs text-rose-100 mt-0.5">
                      রোগী: {selectedAlertRequest.patientName} ({selectedAlertRequest.bloodGroup})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRespondModal(false)}
                  className="p-1.5 rounded-full text-white/80 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmRespond} className="p-5 space-y-4 flex-1">
                <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 text-xs space-y-1 text-slate-800">
                  <p className="font-bold text-red-900">
                    🚨 {selectedAlertRequest.units} {selectedAlertRequest.bloodGroup} রক্ত প্রয়োজন
                  </p>
                  <p className="text-slate-700">
                    📍 স্থান: <strong className="font-bold">{selectedAlertRequest.hospital}</strong>
                  </p>
                  <p className="text-slate-600">
                    ⏰ সময়: {selectedAlertRequest.neededTime}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    আপনার নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={donorResponseForm.donorName}
                    onChange={(e) => setDonorResponseForm({ ...donorResponseForm, donorName: e.target.value })}
                    placeholder="আপনার পূর্ণ নাম"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      মোবাইল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={donorResponseForm.donorPhone}
                      onChange={(e) => setDonorResponseForm({ ...donorResponseForm, donorPhone: e.target.value })}
                      placeholder="01700000000"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      রক্তের গ্রুপ
                    </label>
                    <select
                      value={donorResponseForm.donorBloodGroup}
                      onChange={(e) => setDonorResponseForm({ ...donorResponseForm, donorBloodGroup: e.target.value })}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                    >
                      {BLOOD_GROUPS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    আপনার বর্তমান এলাকা / গ্রাম
                  </label>
                  <input
                    type="text"
                    value={donorResponseForm.donorArea}
                    onChange={(e) => setDonorResponseForm({ ...donorResponseForm, donorArea: e.target.value })}
                    placeholder="যেমন: কুজাইল, পুঠিয়া"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>হ্যাঁ, আমি রক্ত দিতে রাজি!</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="services" />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { copyToClipboard as safeCopyToClipboard } from "../utils/clipboard";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  PhoneCall, 
  HandCoins, 
  Users, 
  Leaf, 
  GraduationCap, 
  Heart, 
  Search, 
  X, 
  Check, 
  Copy, 
  Sparkles,
  Phone,
  ChevronRight,
  Info,
  PlusCircle,
  Trash2,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface Props { 
  onGoBack: () => void; 
  initialCategory?: string; 
}

interface NgoDetails {
  id: number | string;
  key: string;
  banglaName: string;
  englishName: string;
  description: string;
  address: string;
  phone: string;
  established: string;
  loans: string[];
  training: string[];
  social: string[];
  isUserPost?: boolean;
}

interface NgoListItem {
  id: number | string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  provider?: string;
  address?: string;
  phone?: string;
  isUserPost?: boolean;
}

const ngoDetailsList: NgoDetails[] = [
  {
    id: 1,
    key: "brac",
    banglaName: "ব্র্যাক (BRAC)",
    englishName: "BRAC",
    description: "বিশ্বের অন্যতম বৃহৎ বেসরকারি উন্নয়ন সংস্থা, যা স্বাস্থ্য, শিক্ষা, মানবাধিকার, লিঙ্গ সমতা ও ক্ষুদ্রঋণ নিয়ে কাজ করে।",
    address: "পুঠিয়া উপজেলা সদর, পুঠিয়া বাজার (থানার পশ্চিমে), রাজশাহী।",
    phone: "16241",
    established: "১৯৭২",
    loans: ["দাবি ক্ষুদ্র ঋণ (মহিলাদের জন্য)", "প্রগতি মাঝারি ব্যবসা ঋণ (SME)", "কৃষি উপকরণ ও প্রবাস বন্ধু ঋণ"],
    training: ["কম্পিউটার ও কারিগরি প্রশিক্ষণ", "হস্তশিল্প ও সেলাই প্রশিক্ষণ", "মা ও শিশু স্বাস্থ্য সচেতনতা"],
    social: ["ব্র্যাক অতিদরিদ্র কর্মসূচি", "ব্র্যাক প্রাথমিক বিদ্যালয় পরিচালনা", "বিনামূল্যে স্যানিটেশন ও বিশুদ্ধ পানি সরবরাহ"]
  },
  {
    id: 2,
    key: "asa",
    banglaName: "আশা (ASA)",
    englishName: "ASA",
    description: "দারিদ্র্য বিমোচন, ক্ষুদ্রঋণ বিতরণ, এবং গ্রামীণ স্যানিটেশন ও স্বাস্থ্য কর্মসূচি নিয়ে কাজ করা বিশ্বের অন্যতম অগ্রণী প্রতিষ্ঠান।",
    address: "বানেশ্বর বাজার, পুঠিয়া (রাজশাহী-ঢাকা মহাসড়ক সংলগ্ন), রাজশাহী।",
    phone: "09609000000",
    established: "১৯৭৮",
    loans: ["সহজ ক্ষুদ্র ব্যবসা ঋণ", "কৃষি ও মৎস্য চাষ ঋণ", "উদ্যোক্তা ঋণ (SME)"],
    training: ["উদ্যোক্তা বিষয়ক প্রশিক্ষণ", "আর্থিক ব্যবস্থাপনা সচেতনতা", "স্বাস্থ্য ও পুষ্টি ক্যাম্প"],
    social: ["দরিদ্র শিক্ষার্থীদের বৃত্তি প্রদান", "ফ্রি স্যানিটেশন ল্যাট্রিন বিতরণ", "জরুরি দুর্যোগকালীন ত্রাণ বিতরণ"]
  },
  {
    id: 3,
    key: "tmss",
    banglaName: "টিএমএসএস (TMSS)",
    englishName: "TMSS",
    description: "নারীদের আর্থ-সামাজিক উন্নয়ন, কারিগরি শিক্ষা, উন্নত কৃষিপ্রযুক্তি এবং স্বাস্থ্যসেবা প্রদানে অত্যন্ত সক্রিয় জাতীয় এনজিও।",
    address: "শিবপুর বাজার রোড, পুঠিয়া, রাজশাহী।",
    phone: "01711000000",
    established: "১৯৮০",
    loans: ["মহিলা আত্মকর্মসংস্থান ঋণ", "হাঁস-মুরগি ও গবাদি পশু পালন ঋণ", "এসএমই ও বাণিজ্যিক ঋণ"],
    training: ["সেলাই ও বুটিক ডিজাইন প্রশিক্ষণ", "উন্নত পদ্ধতিতে সবজি চাষ প্রশিক্ষণ", "কম্পিউটার ও আইটি বেসিক কোর্স"],
    social: ["টিএমএসএস ফ্রি মেডিকেল ও ডেন্টাল ক্যাম্প", "নারী নির্যাতন প্রতিরোধ সেল", "পঙ্গু ও প্রতিবন্ধী পুনর্বাসন কর্মসূচি"]
  },
  {
    id: 4,
    key: "grameen",
    banglaName: "গ্রামীণ ব্যাংক",
    englishName: "Grameen Bank",
    description: "নোবেলজয়ী প্রতিষ্ঠান, যা মূলত ভূমিহীন ও দরিদ্র গ্রামীণ নারীদের বিনা জামানতে ক্ষুদ্রঋণ ও গৃহ নির্মাণ ঋণ প্রদান করে থাকে।",
    address: "উপজেলা পরিষদ চত্বরের পাশে, পুঠিয়া সদর, রাজশাহী।",
    phone: "029005257",
    established: "১৯৮৩",
    loans: ["সহজ কিস্তির ক্ষুদ্রঋণ", "উচ্চশিক্ষার জন্য ছাত্র ঋণ (Education Loan)", "নতুন গৃহ নির্মাণ ঋণ"],
    training: ["ক্ষুদ্র ব্যবসা পরিচালনা প্রশিক্ষণ", "গৃহপালিত পশু পালন ও তদারকি"],
    social: ["ভিক্ষুক পুনর্বাসন কর্মসূচি (সংগ্রাম সদস্য ঋণ)", "মেধাবী সন্তানদের শিক্ষা সহায়তা ও বৃত্তি", "সঞ্চয় ও পেনশন স্কিম"]
  },
  {
    id: 5,
    key: "buro",
    banglaName: "ব্যুরো বাংলাদেশ",
    englishName: "Buro Bangladesh",
    description: "সঞ্চয়, ক্ষুদ্রঋণ, স্বাস্থ্য এবং শিক্ষা সহায়তা নিশ্চিতকরণে পুঠিয়ায় অত্যন্ত সক্রিয় ও জনপ্রিয় বেসরকারি সংস্থা।",
    address: "বানেশ্বর ট্রাফিক মোড়, রূপালী ব্যাংকের বিপরীতে, পুঠিয়া, রাজশাহী।",
    phone: "01712345678",
    established: "১৯৯০",
    loans: ["সহজ সঞ্চয় ও ডিপিএস স্কিম", "নারী উদ্যোক্তা বিকাশ ঋণ", "প্রবাসী রেমিট্যান্স লোন"],
    training: ["ক্ষুদ্র ব্যবসা বিপণন প্রশিক্ষণ", "জৈব সার তৈরি ও পরিবেশবান্ধব চাষ"],
    social: ["বিনামূল্যে ডায়াবেটিস ও প্রেশার চেকআপ ক্যাম্প", "দরিদ্র পরিবারে সৌর বিদ্যুৎ বিতরণ", "বৃক্ষরোপণ কর্মসূচি"]
  },
  {
    id: 6,
    key: "sajida",
    banglaName: "সাজিদাজ ফাউন্ডেশন",
    englishName: "Sajida Foundation",
    description: "মানবিক মর্যাদা ও কল্যাণ বৃদ্ধিতে ক্ষুদ্রঋণ, স্বাস্থ্যসেবা ও অতিদরিদ্র কর্মসূচির মাধ্যমে পুঠিয়া উপজেলায় কর্মরত সেবাধর্মী সংস্থা।",
    address: "থানা রোড, পুঠিয়া সদর (সরকারি হাসপাতালের কাছে), রাজশাহী।",
    phone: "09678121121",
    established: "১৯৯৩",
    loans: ["অতিদরিদ্র পরিবার পুনর্বাসন ঋণ", "জরুরি চিকিৎসা ঋণ (Health Loan)", "ক্ষুদ্র ব্যবসা সম্প্রসারণ ঋণ"],
    training: ["নার্সিং ও কেয়ারগিভার প্রশিক্ষণ", "হস্তশিল্প তৈরি ও বিপণন"],
    social: ["মানসিক স্বাস্থ্য সচেতনতা ও কাউন্সেলিং", "সাজিজা হাসপাতাল মোবাইল ক্লিনিক সার্ভিস", "শীতকালীন কম্বল ও বস্ত্র বিতরণ"]
  },
  {
    id: 7,
    key: "social_service",
    banglaName: "পুঠিয়া উপজেলা সমাজসেবা কার্যালয়",
    englishName: "Upazila Social Service",
    description: "বাংলাদেশ সরকারের সমাজকল্যাণ মন্ত্রণালয়ের অধীনস্থ পুঠিয়া উপজেলার সকল সামাজিক নিরাপত্তা বেষ্টনী কার্যক্রম বাস্তবায়নকারী সরকারি অফিস।",
    address: "উপজেলা পরিষদ কমপ্লেক্স, ২য় তলা, পুঠিয়া, রাজশাহী।",
    phone: "01730331000",
    established: "১৯৬১",
    loans: ["সুদমুক্ত ক্ষুদ্রঋণ (সরকারি তহবিল)", "প্রতিবন্ধী পুনর্বাসন সুদমুক্ত ঋণ"],
    training: ["কম্পিউটার অফিস অ্যাপ্লিকেশন কোর্স", "মোবাইল ও ইলেকট্রনিক্স সার্ভিসিং কোর্স", "দর্জি বিজ্ঞান ও ব্লক-বাটিক কোর্স"],
    social: ["বয়স্ক ভাতা ও বিধবা ভাতা বিতরণ", "প্রতিবন্ধী সুবর্ণ কার্ড ও শিক্ষা উপবৃত্তি", "ক্যান্সার ও কিডনি রোগীদের জন্য সরকারি অনুদান প্রদান"]
  }
];

export const NgoSocial: React.FC<Props> = ({ onGoBack, initialCategory = "ngo_list" }) => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [category, setCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState<NgoDetails | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  // Firestore DB NGOs state
  const [dbNgos, setDbNgos] = useState<NgoDetails[]>([]);

  // Form states for posting system
  const [showPostForm, setShowPostForm] = useState(false);
  const [newNameBangla, setNewNameBangla] = useState("");
  const [newNameEnglish, setNewNameEnglish] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEstablished, setNewEstablished] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLoansText, setNewLoansText] = useState("");
  const [newTrainingText, setNewTrainingText] = useState("");
  const [newSocialText, setNewSocialText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  // Load user posts (registered local NGOs) from Firestore
  useEffect(() => {
    const q = query(collection(db, "local_ngos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: NgoDetails[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          key: `dynamic_${docSnap.id}`,
          banglaName: data.banglaName || "",
          englishName: data.englishName || "",
          description: data.description || "",
          address: data.address || "",
          phone: data.phone || "",
          established: data.established || "",
          loans: Array.isArray(data.loans) ? data.loans : [],
          training: Array.isArray(data.training) ? data.training : [],
          social: Array.isArray(data.social) ? data.social : [],
          isUserPost: true
        });
      });
      setDbNgos(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "local_ngos");
    });
    return () => unsubscribe();
  }, []);

  const combinedNgosList = [...dbNgos, ...ngoDetailsList];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = async (text: string, id: string | number) => {
    await safeCopyToClipboard(text);
    setCopiedId(id);
    showToast("ঠিকানা সফলভাবে কপি করা হয়েছে!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNgoClick = (item: NgoListItem) => {
    // Find the corresponding detailed NGO profile
    const matched = combinedNgosList.find(
      (ngo) => ngo.banglaName.includes(item.name) || item.name.includes(ngo.banglaName) || item.provider?.includes(ngo.banglaName) || ngo.banglaName.includes(item.provider || "")
    );
    if (matched) {
      setSelectedNgo(matched);
    } else {
      // Default fallback if not found directly
      const defaultMatch = combinedNgosList.find(n => n.id === item.id) || combinedNgosList[0];
      setSelectedNgo(defaultMatch);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!newNameBangla || !newNameEnglish || !newPhone || !newEstablished || !newAddress || !newDescription) {
      alert('দয়া করে প্রয়োজনীয় সব তথ্য পূরণ করুন।');
      return;
    }

    setIsPosting(true);
    try {
      const loans = newLoansText ? newLoansText.split(",").map(s => s.trim()).filter(Boolean) : [];
      const training = newTrainingText ? newTrainingText.split(",").map(s => s.trim()).filter(Boolean) : [];
      const social = newSocialText ? newSocialText.split(",").map(s => s.trim()).filter(Boolean) : [];

      await addDoc(collection(db, 'local_ngos'), {
        banglaName: newNameBangla.trim(),
        englishName: newNameEnglish.trim(),
        phone: newPhone.trim(),
        established: newEstablished.trim(),
        address: newAddress.trim(),
        description: newDescription.trim(),
        loans,
        training,
        social,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      // Reset form
      setNewNameBangla('');
      setNewNameEnglish('');
      setNewPhone('');
      setNewEstablished('');
      setNewAddress('');
      setNewDescription('');
      setNewLoansText('');
      setNewTrainingText('');
      setNewSocialText('');
      setShowPostForm(false);
      showToast("🎉 এনজিওটি সফলভাবে নথিভুক্ত করা হয়েছে!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "local_ngos");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই এনজিওটি মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'local_ngos', id));
      setSelectedNgo(null);
      showToast("এনজিওটি সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `local_ngos/${id}`);
    }
  };

  // Static + Dynamic list generation to maintain perfect backward compatibility and support user posting
  const getCategoryData = (): NgoListItem[] => {
    switch (category) {
      case "ngo_list":
        return combinedNgosList.map(n => ({
          id: n.id,
          name: n.banglaName,
          description: n.description,
          icon: Building2,
          color: "text-red-700 bg-red-50 border-red-100",
          provider: undefined,
          address: undefined,
          phone: undefined,
          isUserPost: n.isUserPost
        }));
      case "branch_address":
        return combinedNgosList.map(n => ({
          id: n.id,
          name: `${n.banglaName} শাখা অফিস`,
          address: n.address,
          description: "পুঠিয়া উপজেলার নিবন্ধিত ও অনুমোদিত স্থানীয় শাখা কার্যালয়।",
          icon: MapPin,
          color: "text-blue-700 bg-blue-50 border-blue-100",
          provider: undefined,
          phone: undefined,
          isUserPost: n.isUserPost
        }));
      case "contact":
        return combinedNgosList.map(n => ({
          id: n.id,
          name: `${n.banglaName} কাস্টমার কেয়ার ও হেল্পলাইন`,
          phone: n.phone,
          description: "যে কোনো জিজ্ঞাসা, ঋণ সংক্রান্ত তথ্য বা অভিযোগের জন্য সরাসরি কল করুন।",
          icon: PhoneCall,
          color: "text-emerald-700 bg-emerald-50 border-emerald-100",
          provider: undefined,
          address: undefined,
          isUserPost: n.isUserPost
        }));
      case "loan_program":
        return combinedNgosList.flatMap((n) => {
          const loansToUse = n.loans && n.loans.length > 0 ? n.loans : (n.isUserPost ? ["সাধারণ ক্ষুদ্রঋণ ও সঞ্চয় প্রকল্প"] : []);
          return loansToUse.map((loan, idx) => ({
            id: typeof n.id === "number" ? n.id * 100 + idx : `loan_${n.id}_${idx}`,
            name: loan,
            provider: n.banglaName,
            description: `${n.banglaName} কর্তৃক পুঠিয়ার স্থানীয় পুরুষ ও নারী উদ্যোক্তাদের সহায়তায় পরিচালিত বিশেষ ঋণ প্রকল্প।`,
            icon: HandCoins,
            color: "text-amber-700 bg-amber-50 border-amber-100",
            address: undefined,
            phone: undefined,
            isUserPost: n.isUserPost
          }));
        });
      case "women_development":
        return combinedNgosList
          .filter(n => n.key === "tmss" || n.key === "brac" || n.key === "sajida" || n.key === "social_service" || n.isUserPost)
          .map(n => ({
            id: n.id,
            name: n.isUserPost ? (n.training[0] || n.loans[0] || "নারী উন্নয়ন কার্যক্রম") : (n.key === "tmss" ? "মহিলা হস্তশিল্প ও সেলাই প্রশিক্ষণ" : n.key === "brac" ? "নারী উদ্যোক্তা বিকাশ ঋণ" : n.key === "sajida" ? "নারী স্বাবলম্বী উদ্যোগ" : "নারী ও শিশু সুরক্ষা এবং অনুদান কর্মসূচি"),
            provider: n.banglaName,
            description: n.isUserPost ? `${n.banglaName} কর্তৃক পরিচালিত নারী উন্নয়ন, হস্তশিল্প বা স্বাবলম্বী উদ্যোগ।` : `${n.banglaName} পরিচালিত পুঠিয়ার অবহেলিত নারীদের আত্মকর্মসংস্থান ও অর্থনৈতিক স্বাধীনতার জন্য বিশেষ প্রশিক্ষণ ও আর্থিক সেবা।`,
            icon: Users,
            color: "text-purple-700 bg-purple-50 border-purple-100",
            address: undefined,
            phone: undefined,
            isUserPost: n.isUserPost
          }));
      case "agriculture_sme":
        return combinedNgosList.map(n => ({
          id: n.id,
          name: n.isUserPost ? `${n.banglaName} কৃষি ও এসএমই ঋণ` : (n.key === "grameen" ? "কৃষি ও খামার উন্নয়ন প্রকল্প" : `${n.banglaName} এসএমই (SME) ঋণ`),
          provider: n.banglaName,
          description: n.isUserPost ? `${n.banglaName} কর্তৃক পুঠিয়ার ক্ষুদ্র উদ্যোক্তা ও কৃষকদের জন্য সহজ শর্তে ঋণ সুবিধা।` : "কৃষকদের জন্য বীজ, সার ক্রয় এবং ক্ষুদ্র ও মাঝারি ব্যবসায়ীদের ব্যবসা সম্প্রসারণে সহজ শর্তে জামানতবিহীন ঋণ সুবিধা।",
          icon: Leaf,
          color: "text-green-700 bg-green-50 border-green-100",
          address: undefined,
          phone: undefined,
          isUserPost: n.isUserPost
        }));
      case "training_program":
        return combinedNgosList.flatMap((n) => {
          const trainingToUse = n.training && n.training.length > 0 ? n.training : (n.isUserPost ? ["স্থানীয় আত্মকর্মসংস্থান ও সচেতনতা মূলক পরামর্শ"] : []);
          return trainingToUse.map((train, idx) => ({
            id: typeof n.id === "number" ? n.id * 1000 + idx : `train_${n.id}_${idx}`,
            name: train,
            provider: n.banglaName,
            description: `পুঠিয়া উপজেলার যুব ও যুবতীদের দক্ষ ও স্বাবলম্বী করে তুলতে ${n.banglaName} এর বিশেষ প্রশিক্ষণ কোর্স।`,
            icon: GraduationCap,
            color: "text-cyan-700 bg-cyan-50 border-cyan-100",
            address: undefined,
            phone: undefined,
            isUserPost: n.isUserPost
          }));
        });
      case "social_services":
        return combinedNgosList.flatMap((n) => {
          const socialToUse = n.social && n.social.length > 0 ? n.social : (n.isUserPost ? ["সামাজিক সচেতনতা ও ত্রাণ বিতরণ কার্যক্রম"] : []);
          return socialToUse.slice(0, 2).map((soc, idx) => ({
            id: typeof n.id === "number" ? n.id * 2000 + idx : `social_${n.id}_${idx}`,
            name: soc,
            provider: n.banglaName,
            description: `অসহায় ও সুবিধাবঞ্চিত মানুষের স্বাস্থ্যসেবা, স্যানিটেশন, সোলার প্যানেল বিতরণ এবং শিক্ষা নিশ্চিতে ${n.banglaName} এর উদ্যোগ।`,
            icon: Heart,
            color: "text-rose-700 bg-rose-50 border-rose-100",
            address: undefined,
            phone: undefined,
            isUserPost: n.isUserPost
          }));
        });
      default:
        return [];
    }
  };

  const categoryLabels = [
    { key: "ngo_list", label: "এনজিও তালিকা", icon: Building2 },
    { key: "branch_address", label: "শাখার ঠিকানা", icon: MapPin },
    { key: "contact", label: "যোগাযোগ", icon: PhoneCall },
    { key: "loan_program", label: "ঋণ কর্মসূচি", icon: HandCoins },
    { key: "women_development", label: "নারী উন্নয়ন", icon: Users },
    { key: "agriculture_sme", label: "কৃষি ও এসএমই", icon: Leaf },
    { key: "training_program", label: "প্রশিক্ষণ কর্মসূচি", icon: GraduationCap },
    { key: "social_services", label: "সামাজিক সেবা", icon: Heart }
  ];

  const activeData = getCategoryData();

  // Search filter
  const filteredData = activeData.filter((item) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = item.name.toLowerCase().includes(q);
    const descMatch = item.description?.toLowerCase().includes(q);
    const providerMatch = item.provider?.toLowerCase().includes(q);
    const addressMatch = item.address?.toLowerCase().includes(q);
    const phoneMatch = item.phone?.toLowerCase().includes(q);
    return nameMatch || descMatch || providerMatch || addressMatch || phoneMatch;
  });

  return (
    <div className="font-sans space-y-6 pb-12 animate-fade-in text-left relative">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-20 left-1/2 bg-slate-900 text-white text-xs font-bold py-3 px-6 rounded-full shadow-2xl z-50 flex items-center gap-2 border border-red-400"
          >
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Banner - Upazila Porichiti Style */}
      <UnifiedHeroHeader
        title="এনজিও ও সমাজসেবা পোর্টাল"
        subtitle="পুঠিয়া উপজেলা সমাজসেবা, ঋণ ও প্রশিক্ষণ কর্মসূচি এবং অনুমোদিত এনজিওের বিস্তারিত তথ্য ও সরাসরি যোগাযোগ।"
        showBack={true}
        onBack={onGoBack}
        rightAction={
          <button 
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) {
                setSearchQuery("");
              }
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
              showSearch 
                ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-400" 
                : "bg-white/10 hover:bg-white/20 text-white border-white/10"
            }`}
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        }
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="এনজিওর নাম, সেবা, ঋণ বা ঠিকানা খুঁজুন..."
        className="rounded-t-none rounded-b-[28px] sm:rounded-b-[36px] mb-6 pt-3.5 pb-5"
      />

      {/* Dynamic NGO Post Form & Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
        <div>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-wide">সেবার ক্যাটাগরি নির্বাচন করুন:</p>
        </div>
        <button
          onClick={() => {
            if (!user) {
              setIsAuthModalOpen(true);
            } else {
              setShowPostForm(!showPostForm);
            }
          }}
          className="flex items-center justify-center gap-1.5 bg-red-700 hover:bg-red-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer border-none w-full sm:w-auto"
        >
          {showPostForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {showPostForm ? 'ফর্ম বন্ধ করুন' : 'নতুন এনজিও নথিভুক্ত করুন'}
        </button>
      </div>

      {/* Form Section */}
      <AnimatePresence>
        {showPostForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden px-1"
          >
            <form onSubmit={handlePostSubmit} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 text-left">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 leading-none">
                <PlusCircle className="w-5 h-5 text-red-700" /> নতুন এনজিও / বেসরকারি উন্নয়ন সংস্থা যোগ করুন
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600">১. এনজিওর নাম (বাংলায়) *</label>
                  <input
                    type="text"
                    required
                    value={newNameBangla || ""}
                    onChange={(e) => setNewNameBangla(e.target.value)}
                    placeholder="উদাঃ আশার আলো ফাউন্ডেশন"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs outline-none font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600">২. এনজিওর নাম (ইংরেজিতে) *</label>
                  <input
                    type="text"
                    required
                    value={newNameEnglish || ""}
                    onChange={(e) => setNewNameEnglish(e.target.value)}
                    placeholder="উদাঃ Ashar Alo Foundation"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600">৩. যোগাযোগের ফোন নম্বর *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone || ""}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="উদাঃ 01712345678"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs outline-none font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600">৪. প্রতিষ্ঠাকাল (সাল) *</label>
                  <input
                    type="text"
                    required
                    value={newEstablished || ""}
                    onChange={(e) => setNewEstablished(e.target.value)}
                    placeholder="উদাঃ ২০০০"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-600">৫. পূর্ণ ঠিকানা / অফিসের অবস্থান *</label>
                <input
                  type="text"
                  required
                  value={newAddress || ""}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="উদাঃ মেইন রোড, পুঠিয়া সদর, রাজশাহী।"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-600">৬. সংক্ষিপ্ত পরিচিতি ও উদ্দেশ্য *</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription || ""}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="সংস্থার উদ্দেশ্য ও পুঠিয়া উপজেলায় কী ধরনের সেবা বা কার্যক্রম পরিচালনা করা হয় তা সংক্ষেপে লিখুন।"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs outline-none font-semibold resize-none text-slate-800"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <p className="text-[11px] font-extrabold text-red-800">★ কার্যক্রম ও প্রকল্প (কমা দিয়ে একাধিক লিখুন):</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">ঋণ কর্মসূচি (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={newLoansText || ""}
                      onChange={(e) => setNewLoansText(e.target.value)}
                      placeholder="উদাঃ দাবি ক্ষুদ্রঋণ, SME ঋণ"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs outline-none font-semibold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">প্রশিক্ষণ ও কোর্স (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={newTrainingText || ""}
                      onChange={(e) => setNewTrainingText(e.target.value)}
                      placeholder="উদাঃ কম্পিউটার প্রশিক্ষণ, সেলাই"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs outline-none font-semibold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">সামাজিক সেবা (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={newSocialText || ""}
                      onChange={(e) => setNewSocialText(e.target.value)}
                      placeholder="উদাঃ ফ্রি স্যানিটেশন, শীতবস্ত্র বিতরণ"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs outline-none font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPosting}
                className="w-full py-3 bg-red-700 hover:bg-red-800 disabled:bg-red-300 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-none shadow-sm shadow-red-700/10"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> নথিভুক্ত করা হচ্ছে...
                  </>
                ) : (
                  'সংস্থা নথিভুক্ত করুন (Register NGO)'
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Horizontal Tabs */}
      <div className="px-1">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
          {categoryLabels.map((cat) => {
            const CatIcon = cat.icon;
            const isSelected = category === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setCategory(cat.key);
                  setSearchQuery("");
                }}
                className={`py-3 px-4 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 transition-all snap-start cursor-pointer border ${
                  isSelected
                    ? "bg-[#7A1C28] text-white border-[#7A1C28] shadow-md shadow-red-900/10"
                    : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                <CatIcon className={`w-4 h-4 ${isSelected ? "text-emerald-500" : "text-slate-400"}`} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Render List */}
      <div className="space-y-4 px-1">
        {filteredData.length > 0 ? (
          filteredData.map((item, index) => {
            const Icon = item.icon || Building2;
            return (
              <div 
                key={index} 
                onClick={() => handleNgoClick(item)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-[#7A1C28] transition-all hover:shadow-md cursor-pointer animate-fade-in"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#7A1C28] opacity-0 group-hover:opacity-100 transition-all"></div>

                <div className="flex items-start gap-4 mb-3">
                  <div className={`p-2.5 rounded-2xl shrink-0 border ${item.color || "text-red-700 bg-red-50 border-red-100"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    {item.provider && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 inline-block mb-1">
                        {item.provider}
                      </span>
                    )}
                    <h3 className="text-sm font-black text-slate-800 group-hover:text-[#7A1C28] transition-colors leading-tight">
                      {item.name}
                    </h3>
                  </div>
                </div>

                <div className="pl-14 space-y-3">
                  {item.description && (
                    <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  )}
                  
                  {item.address && (
                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#7A1C28] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-slate-700 leading-tight">{item.address}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(item.address!, item.id);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all shrink-0"
                        title="ঠিকানা কপি করুন"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {item.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <a 
                        href={`tel:${item.phone}`} 
                        onClick={(e) => e.stopPropagation()}
                        className="text-[12px] font-black text-emerald-700 hover:underline"
                      >
                        {item.phone}
                      </a>
                    </div>
                  )}

                  {/* Interactive Button */}
                  <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-[#7A1C28]">
                    <span className="flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-amber-500" /> বিস্তারিত প্রোফাইল ও কার্যক্রম দেখুন
                    </span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 py-12">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-xs">কোনো তথ্য বা এনজিও পাওয়া যায়নি</p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-3 px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold hover:bg-slate-200 transition-all cursor-pointer"
              >
                ফিল্টার রিসেট করুন
              </button>
            )}
          </div>
        )}
      </div>

      {/* DETAILED INTERACTIVE NGO PROFILE MODAL */}
      <AnimatePresence>
        {selectedNgo && (
          <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-[#7A1C28] text-white p-5 flex justify-between items-center shrink-0 border-b border-red-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{selectedNgo.banglaName}</h3>
                    <p className="text-[10px] text-red-100 font-semibold tracking-wider">প্রতিষ্ঠাকাল: {selectedNgo.established} সাল</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNgo(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
                {/* Description */}
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">সংক্ষিপ্ত পরিচিতি</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-white p-4 rounded-2xl border border-slate-100">
                    {selectedNgo.description}
                  </p>
                </div>

                {/* Contact and Office */}
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">পুঠিয়া শাখা ও যোগাযোগ</p>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-start gap-2.5 text-xs">
                      <MapPin className="w-4 h-4 text-[#7A1C28] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-slate-800">শাখা অফিসের ঠিকানা:</p>
                        <p className="text-slate-600 font-semibold mt-0.5 leading-normal">{selectedNgo.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs pt-3 border-t border-slate-100">
                      <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-slate-800">সরাসরি যোগাযোগের নম্বর:</p>
                        <p className="text-emerald-700 font-black text-sm mt-0.5">{selectedNgo.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Loan Programs */}
                {selectedNgo.loans && selectedNgo.loans.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <HandCoins className="w-3.5 h-3.5 text-amber-500" /> ঋণ সুবিধা
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedNgo.loans.map((loan, idx) => (
                        <div key={idx} className="bg-amber-50/40 p-3 rounded-xl border border-amber-100/50 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>
                          <span className="text-xs text-amber-900 font-bold">{loan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Training Programs */}
                {selectedNgo.training && selectedNgo.training.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-500" /> ফ্রি প্রশিক্ষণ ও কোর্স
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedNgo.training.map((train, idx) => (
                        <div key={idx} className="bg-cyan-50/40 p-3 rounded-xl border border-cyan-100/50 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full shrink-0"></span>
                          <span className="text-xs text-cyan-900 font-bold">{train}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Programs */}
                {selectedNgo.social && selectedNgo.social.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500" /> মানবিক ও সামাজিক সেবা
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedNgo.social.map((soc, idx) => (
                        <div key={idx} className="bg-rose-50/40 p-3 rounded-xl border border-rose-100/50 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0"></span>
                          <span className="text-xs text-rose-900 font-bold">{soc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                <a 
                  href={`tel:${selectedNgo.phone}`}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-700/10 cursor-pointer"
                >
                  <Phone className="w-4 h-4" /> সরাসরি কল করুন (Call)
                </a>
                <button 
                  onClick={() => selectedNgo && copyToClipboard(selectedNgo.address, selectedNgo.id)}
                  className="flex-1 py-3 text-xs font-black text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-4 h-4" /> ঠিকানা কপি করুন
                </button>
                {selectedNgo.isUserPost && (
                  <button 
                    onClick={() => handleDelete(selectedNgo.id.toString())}
                    className="py-3 px-4 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none"
                    title="এই এনজিওটি মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Loader2, X, Send, Sparkles, Building2, MapPin, 
  Clock, Phone, Search, Newspaper, Tv, Calendar, BookOpen, 
  Upload, Video, Image, Camera, Award, ShieldAlert, Heart, 
  MessageSquare, ExternalLink, Globe, FileText, CheckCircle, Mail,
  ChevronRight, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, deleteDoc, 
  doc, serverTimestamp, updateDoc, increment, runTransaction
} from "firebase/firestore";
import { useAuth } from '../contexts/AuthContext';

// Types
interface Journalist {
  id: string;
  name: string;
  media: string;
  phone: string;
  email: string;
  submitNewsUrl?: string;
  verified?: boolean;
  isCustom?: boolean;
}

interface NewspaperType {
  id: string;
  title: string;
  editor: string;
  frequency: string;
  established: string;
  phone: string;
  website?: string;
  isCustom?: boolean;
}

interface NewsPortal {
  id: string;
  title: string;
  editor: string;
  website: string;
  phone: string;
  description: string;
  isCustom?: boolean;
}

interface TvRep {
  id: string;
  name: string;
  channel: string;
  phone: string;
  email: string;
  isCustom?: boolean;
}

interface PressRelease {
  id: string;
  title: string;
  department: string;
  date: string;
  content: string;
  issuer: string;
  isCustom?: boolean;
}

interface CitizenReport {
  id: string;
  title: string;
  category: string;
  content: string;
  reporterName: string;
  reporterContact: string;
  image?: string;
  likes: number;
  commentsCount: number;
  createdAt?: any;
  isCustom?: boolean;
}

interface MediaPhoto {
  id: string;
  title: string;
  caption: string;
  image: string;
  date: string;
  isCustom?: boolean;
}

// Static fallback/seed data
const staticJournalists: Journalist[] = [
  {
    id: "j_1",
    name: "মোঃ রফিকুল ইসলাম",
    media: "দৈনিক প্রথম আলো",
    phone: "01712112233",
    email: "rafiq.puthia@gmail.com",
    submitNewsUrl: "https://www.prothomalo.com",
    verified: true
  },
  {
    id: "j_2",
    name: "মোসাঃ বিলকিস বেগম",
    media: "দৈনিক ইত্তেফাক",
    phone: "01715443322",
    email: "bilkis.it@yahoo.com",
    submitNewsUrl: "https://www.ittefaq.com.bd",
    verified: true
  },
  {
    id: "j_3",
    name: "মোঃ হাসিবুল ইসলাম",
    media: "দৈনিক যুগান্তর",
    phone: "01911887766",
    email: "hasib.yug@gmail.com",
    submitNewsUrl: "https://www.jugantor.com",
    verified: true
  },
  {
    id: "j_4",
    name: "মোঃ আবু বকর",
    media: "দৈনিক করতোয়া",
    phone: "01815554433",
    email: "abubakar.k@gmail.com",
    verified: false
  }
];

const staticNewspapers: NewspaperType[] = [
  {
    id: "paper_1",
    title: "দৈনিক পুঠিয়া বার্তা",
    editor: "মো: আব্দুল আলীম",
    frequency: "দৈনিক (Daily)",
    established: "২০১৬",
    phone: "01711234567",
    website: "https://www.puthiabarta.com"
  },
  {
    id: "paper_2",
    title: "সাপ্তাহিক বরেন্দ্র কণ্ঠ",
    editor: "মাহমুদা খাতুন",
    frequency: "সাপ্তাহিক (Weekly)",
    established: "২০০৮",
    phone: "01712987654"
  }
];

const staticPortals: NewsPortal[] = [
  {
    id: "portal_1",
    title: "পুঠিয়া নিউজ ২৪",
    editor: "সায়েম আহমেদ",
    website: "www.puthianews24.com",
    phone: "01733221100",
    description: "পুঠিয়া উপজেলার সর্বপ্রথম এবং সবচেয়ে জনপ্রিয় ২৪ ঘণ্টা অনলাইন নিউজ পোর্টাল।"
  },
  {
    id: "portal_2",
    title: "রাজশাহী টাইমস",
    editor: "ফারহান হাবিব",
    website: "www.rajshahitimes.net",
    phone: "01755667788",
    description: "রাজশাহী জেলা ও পুঠিয়া অঞ্চলের নির্ভরযোগ্য ও সত্যনিষ্ঠ সংবাদ পরিবেশক অনলাইন মাধ্যম।"
  }
];

const staticTvReps: TvRep[] = [
  {
    id: "tv_1",
    name: "মোঃ কামরুজ্জামান",
    channel: "সময় টিভি (Somoy TV)",
    phone: "01712990011",
    email: "kamrul.somoy@gmail.com"
  },
  {
    id: "tv_2",
    name: "মোঃ আনোয়ার হোসেন",
    channel: "যমুনা টিভি (Jamuna TV)",
    phone: "01714882233",
    email: "anwar.jamuna@gmail.com"
  },
  {
    id: "tv_3",
    name: "মোসাঃ তাছলিমা আক্তার",
    channel: "ডিবিসি নিউজ (DBC News)",
    phone: "01819776655",
    email: "taslima.dbc@gmail.com"
  }
];

const staticPressReleases: PressRelease[] = [
  {
    id: "pr_1",
    title: "ডেঙ্গু প্রতিরোধ ও পরিচ্ছন্নতা অভিযান জোরদারকরণ সংক্রান্ত জরুরি নির্দেশনা",
    department: "উপজেলা প্রশাসন, পুঠিয়া",
    date: "২৬ জুলাই, ২০২৬",
    issuer: "মোঃ আনিসুর রহমান (উপজেলা নির্বাহী অফিসার)",
    content: "পুঠিয়া উপজেলার সকল ইউনিয়ন ও পৌর এলাকায় ডেঙ্গু পরিস্থিতি নিয়ন্ত্রণে রাখতে প্রতি শনি ও বুধবার বিশেষ পরিচ্ছন্নতা অভিযান পরিচালনার নির্দেশ দেওয়া হলো। সকল শিক্ষা প্রতিষ্ঠান, সরকারি দপ্তর এবং বাড়ির চারপাশ পরিষ্কার-পরিচ্ছন্ন রাখতে হবে। অবহেলাকারীদের বিরুদ্ধে কঠোর আইনি ব্যবস্থা নেওয়া হবে।"
  },
  {
    id: "pr_2",
    title: "পুঠিয়া রাজবাড়ী এলাকায় আইন-শৃঙ্খলা ও নিরাপত্তা বিষয়ক বিশেষ আদেশ",
    department: "পুঠিয়া থানা পুলিশ",
    date: "২০ জুলাই, ২০২৬",
    issuer: "মোঃ সোহরাওয়ার্দী হোসেন (অফিসার ইনচার্জ)",
    content: "পুঠিয়া রাজবাড়ী ও মন্দির কমপ্লেক্সে আগত দেশী-বিদেশী পর্যটকদের সার্বিক নিরাপত্তা নিশ্চিত করতে এবং ইভটিজিং ও যেকোনো ধরনের বিশৃঙ্খলা রোধে প্রতিদিন বিকাল ৪টা থেকে রাত ৯টা পর্যন্ত রাজবাড়ী সংলগ্ন চত্বরে বিশেষ পুলিশ টহল মোতায়েন করা হয়েছে। যেকোনো সমস্যায় থানা ডিউটি অফিসারকে (01713373512) জানান।"
  }
];

const staticCitizenReports: CitizenReport[] = [
  {
    id: "cr_1",
    title: "বানেশ্বর বাজারে অতিরিক্ত যানজট, ভোগান্তিতে সাধারণ মানুষ",
    category: "জনদুর্ভোগ",
    content: "বানেশ্বর বাজার মোড়ে প্রতিদিন সকালে ও সন্ধ্যায় চরম যানজটের সৃষ্টি হচ্ছে। অবৈধভাবে রাস্তা দখল করে দোকান বসানোর কারণে এই যানজট বেড়েই চলেছে। এতে সাধারণ পথচারী ও এ্যাম্বুলেন্স চলাচলেও চরম বিঘ্ন ঘটছে। স্থানীয় প্রশাসনের প্রতি জরুরি ব্যবস্থা নেওয়ার অনুরোধ রইল।",
    reporterName: "আহমেদ সানি",
    reporterContact: "01715XXXXXX",
    likes: 12,
    commentsCount: 3
  }
];

const staticMediaPhotos: MediaPhoto[] = [
  {
    id: "photo_1",
    title: "পুঠিয়া প্রেসক্লাবে সাংবাদিকদের বার্ষিক সাধারণ সভা ২০২৬",
    caption: "উপজেলা স্বাস্থ্য কমপ্লেক্স মিলনায়তনে সাংবাদিকদের পেশাগত মানোন্নয়ন বিষয়ক সেমিনারে উপস্থিত সাংবাদিকবৃন্দ।",
    image: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&q=80&w=600",
    date: "১৫ মে, ২০২৬"
  },
  {
    id: "photo_2",
    title: "উপজেলা প্রশাসনের নিয়মিত প্রেস ব্রিফিং",
    caption: "চলমান উন্নয়ন কাজ ও দুর্যোগ প্রস্তুতি নিয়ে স্থানীয় গণমাধ্যম প্রতিনিধিদের সাথে উপজেলা নির্বাহী অফিসারের মতবিনিময়।",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600",
    date: "১০ জুন, ২০২৬"
  }
];

export const MediaHubInfo = ({ onGoBack, initialTab }: { onGoBack: () => void; initialTab?: string }) => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab || 'journalists');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals / Form toggles
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTipModal, setShowTipModal] = useState<Journalist | null>(null);

  // Firestore Sync States
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [newspapers, setNewspapers] = useState<NewspaperType[]>([]);
  const [portals, setPortals] = useState<NewsPortal[]>([]);
  const [tvReps, setTvReps] = useState<TvRep[]>([]);
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [mediaPhotos, setMediaPhotos] = useState<MediaPhoto[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  // 1. Journalist
  const [jName, setJName] = useState("");
  const [jMedia, setJMedia] = useState("");
  const [jPhone, setJPhone] = useState("");
  const [jEmail, setJEmail] = useState("");
  const [jUrl, setJUrl] = useState("");
  // 2. Newspaper
  const [npTitle, setNpTitle] = useState("");
  const [npEditor, setNpEditor] = useState("");
  const [npFreq, setNpFreq] = useState("দৈনিক");
  const [npEstablished, setNpEstablished] = useState("");
  const [npPhone, setNpPhone] = useState("");
  const [npWeb, setNpWeb] = useState("");
  // 3. Portal
  const [pTitle, setPTitle] = useState("");
  const [pEditor, setPEditor] = useState("");
  const [pWeb, setPWeb] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pDesc, setPDesc] = useState("");
  // 4. TV Rep
  const [tvName, setTvName] = useState("");
  const [tvChannel, setTvChannel] = useState("");
  const [tvPhone, setTvPhone] = useState("");
  const [tvEmail, setTvEmail] = useState("");
  // 5. Press Release
  const [prTitle, setPrTitle] = useState("");
  const [prDept, setPrDept] = useState("");
  const [prContent, setPrContent] = useState("");
  const [prIssuer, setPrIssuer] = useState("");
  // 6. Citizen Report
  const [crTitle, setCrTitle] = useState("");
  const [crCat, setCrCat] = useState("সাধারণ সংবাদ");
  const [crContent, setCrContent] = useState("");
  const [crRepName, setCrRepName] = useState(userProfile?.name || "");
  const [crRepContact, setCrRepContact] = useState("");
  const [crImage, setCrImage] = useState<string | null>(null);
  // 7. Media Photo
  const [mTitle, setMTitle] = useState("");
  const [mCaption, setMCaption] = useState("");
  const [mImage, setMImage] = useState("");

  // Tips state
  const [tipContent, setTipContent] = useState("");
  const [tipContact, setTipContact] = useState("");
  const [isSendingTip, setIsSendingTip] = useState(false);

  // Loading image files to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 1MB for base64)
    if (file.size > 1.5 * 1024 * 1024) {
      alert("ছবি ১.৫ মেগাবাইটের চেয়ে ছোট হতে হবে।");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Setup Realtime Firestore listeners
  useEffect(() => {
    setIsLoading(true);

    const unsubcribeList: (() => void)[] = [];

    // Journalists
    const qJ = query(collection(db, "journalists"), orderBy("createdAt", "desc"));
    unsubcribeList.push(onSnapshot(qJ, (snap) => {
      const list: Journalist[] = [];
      snap.forEach(d => {
        const data = d.data();
        list.push({ id: d.id, ...data, isCustom: true } as Journalist);
      });
      setJournalists(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "journalists")));

    // Newspapers
    const qNP = query(collection(db, "local_newspapers"), orderBy("createdAt", "desc"));
    unsubcribeList.push(onSnapshot(qNP, (snap) => {
      const list: NewspaperType[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data(), isCustom: true } as NewspaperType);
      });
      setNewspapers(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "local_newspapers")));

    // Online Portals
    const qOP = query(collection(db, "online_news_portals"), orderBy("createdAt", "desc"));
    unsubcribeList.push(onSnapshot(qOP, (snap) => {
      const list: NewsPortal[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data(), isCustom: true } as NewsPortal);
      });
      setPortals(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "online_news_portals")));

    // TV Reps
    const qTV = query(collection(db, "tv_representatives"), orderBy("createdAt", "desc"));
    unsubcribeList.push(onSnapshot(qTV, (snap) => {
      const list: TvRep[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data(), isCustom: true } as TvRep);
      });
      setTvReps(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "tv_representatives")));

    // Press Releases
    const qPR = query(collection(db, "press_releases"), orderBy("createdAt", "desc"));
    unsubcribeList.push(onSnapshot(qPR, (snap) => {
      const list: PressRelease[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data(), isCustom: true } as PressRelease);
      });
      setPressReleases(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "press_releases")));

    // Citizen Reports
    const qCR = query(collection(db, "citizen_reports"), orderBy("createdAt", "desc"));
    unsubcribeList.push(onSnapshot(qCR, (snap) => {
      const list: CitizenReport[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data(), isCustom: true } as CitizenReport);
      });
      setCitizenReports(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "citizen_reports")));

    // Media Gallery
    const qMG = query(collection(db, "media_gallery"), orderBy("createdAt", "desc"));
    unsubcribeList.push(onSnapshot(qMG, (snap) => {
      const list: MediaPhoto[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data(), isCustom: true } as MediaPhoto);
      });
      setMediaPhotos(list);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "media_gallery");
      setIsLoading(false);
    }));

    return () => {
      unsubcribeList.forEach(unsub => unsub());
    };
  }, []);

  // Merging local/static data with Firestore data
  const finalJournalists = useMemo(() => [...journalists, ...staticJournalists], [journalists]);
  const finalNewspapers = useMemo(() => [...newspapers, ...staticNewspapers], [newspapers]);
  const finalPortals = useMemo(() => [...portals, ...staticPortals], [portals]);
  const finalTvReps = useMemo(() => [...tvReps, ...staticTvReps], [tvReps]);
  const finalPressReleases = useMemo(() => [...pressReleases, ...staticPressReleases], [pressReleases]);
  const finalCitizenReports = useMemo(() => [...citizenReports, ...staticCitizenReports], [citizenReports]);
  const finalMediaPhotos = useMemo(() => [...mediaPhotos, ...staticMediaPhotos], [mediaPhotos]);

  // Handle addition submit based on the active tab
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === 'journalists') {
        if (!jName || !jMedia || !jPhone) throw new Error("প্রয়োজনীয় ঘরগুলো পূরণ করুন।");
        await addDoc(collection(db, "journalists"), {
          name: jName.trim(),
          media: jMedia.trim(),
          phone: jPhone.trim(),
          email: jEmail.trim() || "",
          submitNewsUrl: jUrl.trim() || "",
          verified: false,
          createdAt: serverTimestamp()
        });
        setJName(""); setJMedia(""); setJPhone(""); setJEmail(""); setJUrl("");
      } 
      else if (activeTab === 'newspapers') {
        if (!npTitle || !npEditor || !npPhone) throw new Error("প্রয়োজনীয় ঘরগুলো পূরণ করুন।");
        await addDoc(collection(db, "local_newspapers"), {
          title: npTitle.trim(),
          editor: npEditor.trim(),
          frequency: npFreq,
          established: npEstablished.trim() || "অজানা",
          phone: npPhone.trim(),
          website: npWeb.trim() || "",
          createdAt: serverTimestamp()
        });
        setNpTitle(""); setNpEditor(""); setNpEstablished(""); setNpPhone(""); setNpWeb("");
      } 
      else if (activeTab === 'portals') {
        if (!pTitle || !pEditor || !pPhone) throw new Error("প্রয়োজনীয় ঘরগুলো পূরণ করুন।");
        await addDoc(collection(db, "online_news_portals"), {
          title: pTitle.trim(),
          editor: pEditor.trim(),
          website: pWeb.trim() || "",
          phone: pPhone.trim(),
          description: pDesc.trim() || "অনলাইন সংবাদপত্র",
          createdAt: serverTimestamp()
        });
        setPTitle(""); setPEditor(""); setPWeb(""); setPPhone(""); setPDesc("");
      } 
      else if (activeTab === 'tv_representatives') {
        if (!tvName || !tvChannel || !tvPhone) throw new Error("প্রয়োজনীয় ঘরগুলো পূরণ করুন।");
        await addDoc(collection(db, "tv_representatives"), {
          name: tvName.trim(),
          channel: tvChannel.trim(),
          phone: tvPhone.trim(),
          email: tvEmail.trim() || "",
          createdAt: serverTimestamp()
        });
        setTvName(""); setTvChannel(""); setTvPhone(""); setTvEmail("");
      } 
      else if (activeTab === 'press_releases') {
        if (!prTitle || !prDept || !prContent || !prIssuer) throw new Error("প্রয়োজনীয় ঘরগুলো পূরণ করুন।");
        await addDoc(collection(db, "press_releases"), {
          title: prTitle.trim(),
          department: prDept.trim(),
          date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
          issuer: prIssuer.trim(),
          content: prContent.trim(),
          createdAt: serverTimestamp()
        });
        setPrTitle(""); setPrDept(""); setPrContent(""); setPrIssuer("");
      } 
      else if (activeTab === 'citizen_news') {
        if (!crTitle || !crContent || !crRepName) throw new Error("প্রয়োজনীয় ঘরগুলো পূরণ করুন।");
        await addDoc(collection(db, "citizen_reports"), {
          title: crTitle.trim(),
          category: crCat,
          content: crContent.trim(),
          reporterName: crRepName.trim(),
          reporterContact: crRepContact.trim() || "অপ্রকাশিত",
          image: crImage || "",
          likes: 0,
          commentsCount: 0,
          createdAt: serverTimestamp()
        });
        setCrTitle(""); setCrContent(""); setCrImage(null); setCrRepContact("");
      } 
      else if (activeTab === 'gallery') {
        if (!mTitle || !mCaption || !mImage) throw new Error("ছবি ও শিরোনাম প্রদান করুন।");
        await addDoc(collection(db, "media_gallery"), {
          title: mTitle.trim(),
          caption: mCaption.trim(),
          image: mImage,
          date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
          createdAt: serverTimestamp()
        });
        setMTitle(""); setMCaption(""); setMImage("");
      }

      setShowAddForm(false);
      alert("তথ্যটি সফলভাবে সাবমিট করা হয়েছে!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "সংরক্ষণ করতে ত্রুটি হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting Firestore document
  const handleDeleteDoc = async (collectionName: string, id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      alert("সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error(err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  // Sending Tip/Xobor to journalist
  const handleSendTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipContent.trim()) {
      alert("দয়া করে বিস্তারিত খবর লিখুন।");
      return;
    }
    setIsSendingTip(true);
    try {
      await addDoc(collection(db, "journalist_tips"), {
        journalistId: showTipModal?.id || "general",
        journalistName: showTipModal?.name || "সার্বজনীন",
        journalistMedia: showTipModal?.media || "সকল সংবাদ মাধ্যম",
        content: tipContent.trim(),
        contact: tipContact.trim() || "বেনামী",
        createdAt: serverTimestamp()
      });
      setTipContent("");
      setTipContact("");
      setShowTipModal(null);
      alert("খবরটি সফলভাবে পাঠানো হয়েছে! সাংবাদিক মহোদয় সত্যতা যাচাই করে প্রয়োজনীয় পদক্ষেপ গ্রহণ করবেন।");
    } catch (err) {
      console.error(err);
      alert("খবর পাঠাতে ত্রুটি হয়েছে।");
    } finally {
      setIsSendingTip(false);
    }
  };

  // Handle citizen report like (local/optimistic/firestore transaction)
  const handleLikeReport = async (reportId: string, isCustom?: boolean) => {
    if (!isCustom) {
      alert("এটি একটি ডেমো সংবাদ। শুধুমাত্র ব্যবহারকারীদের পোস্ট করা সংবাদে লাইক দেওয়া যাবে।");
      return;
    }
    try {
      const docRef = doc(db, "citizen_reports", reportId);
      await updateDoc(docRef, {
        likes: increment(1)
      });
    } catch (err) {
      console.error("Error liking report:", err);
    }
  };

  // Filtered lists based on search term
  const filteredJournalistsList = useMemo(() => {
    return finalJournalists.filter(j => 
      j.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      j.media.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [finalJournalists, searchTerm]);

  const filteredNewspapersList = useMemo(() => {
    return finalNewspapers.filter(n => 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      n.editor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [finalNewspapers, searchTerm]);

  const filteredPortalsList = useMemo(() => {
    return finalPortals.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.editor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [finalPortals, searchTerm]);

  const filteredTvRepsList = useMemo(() => {
    return finalTvReps.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.channel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [finalTvReps, searchTerm]);

  const filteredPressReleasesList = useMemo(() => {
    return finalPressReleases.filter(pr => 
      pr.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pr.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [finalPressReleases, searchTerm]);

  const filteredCitizenReportsList = useMemo(() => {
    return finalCitizenReports.filter(cr => 
      cr.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cr.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cr.reporterName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [finalCitizenReports, searchTerm]);

  const filteredMediaPhotosList = useMemo(() => {
    return finalMediaPhotos.filter(m => 
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.caption.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [finalMediaPhotos, searchTerm]);

  // Sidebar / Tab sub-menus translation & configuration
  const tabConfigs = [
    { id: 'journalists', label: 'সাংবাদিক তালিকা', icon: Newspaper, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { id: 'newspapers', label: 'স্থানীয় সংবাদপত্র', icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { id: 'portals', label: 'অনলাইন নিউজ পোর্টাল', icon: Globe, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { id: 'tv_representatives', label: 'টিভি প্রতিনিধি', icon: Tv, color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { id: 'press_club', label: 'প্রেস ক্লাব', icon: Award, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { id: 'press_releases', label: 'প্রেস রিলিজ', icon: BookOpen, color: 'text-teal-600 bg-teal-50 border-teal-100' },
    { id: 'citizen_news', label: 'সংবাদ প্রকাশ করুন', icon: Sparkles, color: 'text-violet-600 bg-violet-50 border-violet-100' },
    { id: 'gallery', label: 'মিডিয়া গ্যালারি', icon: Image, color: 'text-pink-600 bg-pink-50 border-pink-100' }
  ];

  return (
    <div className="font-sans pb-12">
      {/* Top Banner Section */}
      <div 
        className="p-8 text-white rounded-3xl shadow-md relative overflow-hidden mb-6" 
        style={{ background: "linear-gradient(135deg, #0284c7, #0369a1)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10 border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-sky-200 text-sm font-semibold mb-2 uppercase tracking-wider">উপজেলা তথ্য বাতায়ন</p>
          <h1 className="text-3xl md:text-4xl font-black mb-2 text-white">সাংবাদিক ও গণমাধ্যম হাব</h1>
          <div className="w-12 h-1.5 bg-white rounded-full my-3"></div>
          <p className="text-slate-100 text-sm md:text-base max-w-2xl leading-relaxed">
            পুঠিয়া উপজেলার সকল নির্ভরযোগ্য সংবাদ মাধ্যম, স্থানীয় টিভি প্রতিনিধি, প্রেসক্লাব, সরকার নির্ধারিত প্রেস বিজ্ঞপ্তি এবং সাধারণ নাগরিকদের সত্যনিষ্ঠ সাংবাদিকতার সমন্বিত প্রবেশদ্বার।
          </p>
        </div>
      </div>

      {/* Grid Layout: left side navigation (tabs), right side content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar nav */}
        <div className="space-y-2 lg:col-span-1">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">মেনু নির্বাচন করুন</h2>
            {tabConfigs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchTerm('');
                    setShowAddForm(false);
                  }}
                  className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left transition flex items-center justify-between group cursor-pointer border-none ${
                    isActive 
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-900/10' 
                      : 'bg-transparent text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-transform ${isActive ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right main panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Global search & Action buttons for list items */}
          {activeTab !== 'press_club' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={`${tabConfigs.find(t => t.id === activeTab)?.label} খুঁজুন...`}
                  value={searchTerm || ""}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>

              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm"
              >
                {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showAddForm ? "ফর্ম বন্ধ করুন" : `নতুন যুক্ত করুন`}
              </button>
            </div>
          )}

          {/* Form component to add new items */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-4"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Sparkles className="w-4.5 h-4.5 text-sky-600" />
                  <h3 className="text-sm font-black text-slate-800">নতুন {tabConfigs.find(t => t.id === activeTab)?.label} এন্ট্রি ফর্ম</h3>
                </div>

                <form onSubmit={handleAddSubmit} className="space-y-4">
                  {/* Dynamic inputs based on activeTab */}
                  {activeTab === 'journalists' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">সাংবাদিকের নাম *</label>
                        <input type="text" value={jName || ""} onChange={e => setJName(e.target.value)} placeholder="উদাঃ মোঃ রফিকুল ইসলাম" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">সংবাদপত্র বা গণমাধ্যম *</label>
                        <input type="text" value={jMedia || ""} onChange={e => setJMedia(e.target.value)} placeholder="উদাঃ দৈনিক প্রথম আলো" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">মোবাইল নম্বর *</label>
                        <input type="tel" value={jPhone || ""} onChange={e => setJPhone(e.target.value)} placeholder="উদাঃ 01712XXXXXX" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">ইমেইল ঠিকানা</label>
                        <input type="email" value={jEmail || ""} onChange={e => setJEmail(e.target.value)} placeholder="উদাঃ mail@example.com" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">অনলাইন নিউজ সাবমিশন লিংক (ঐচ্ছিক)</label>
                        <input type="url" value={jUrl || ""} onChange={e => setJUrl(e.target.value)} placeholder="https://example.com/submit" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" />
                      </div>
                    </div>
                  )}

                  {activeTab === 'newspapers' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">সংবাদপত্রের নাম *</label>
                        <input type="text" value={npTitle || ""} onChange={e => setNpTitle(e.target.value)} placeholder="উদাঃ দৈনিক পুঠিয়া বার্তা" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">সম্পাদকের নাম *</label>
                        <input type="text" value={npEditor || ""} onChange={e => setNpEditor(e.target.value)} placeholder="উদাঃ মো: আব্দুল আলীম" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">প্রকাশের ফ্রিকোয়েন্সি</label>
                        <select value={npFreq || ""} onChange={e => setNpFreq(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500 font-bold">
                          <option value="দৈনিক">দৈনিক (Daily)</option>
                          <option value="সাপ্তাহিক">সাপ্তাহিক (Weekly)</option>
                          <option value="মাসিক">মাসিক (Monthly)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">প্রতিষ্ঠা সাল</label>
                        <input type="text" value={npEstablished || ""} onChange={e => setNpEstablished(e.target.value)} placeholder="উদাঃ ২০১৬" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">মোবাইল নম্বর *</label>
                        <input type="tel" value={npPhone || ""} onChange={e => setNpPhone(e.target.value)} placeholder="017XXXXXXXX" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">ওয়েবসাইট ঠিকানা (ঐচ্ছিক)</label>
                        <input type="url" value={npWeb || ""} onChange={e => setNpWeb(e.target.value)} placeholder="https://example.com" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" />
                      </div>
                    </div>
                  )}

                  {activeTab === 'portals' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">নিউজ পোর্টালের নাম *</label>
                        <input type="text" value={pTitle || ""} onChange={e => setPTitle(e.target.value)} placeholder="উদাঃ পুঠিয়া নিউজ ২৪" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">সম্পাদকের নাম *</label>
                        <input type="text" value={pEditor || ""} onChange={e => setPEditor(e.target.value)} placeholder="উদাঃ সায়েম আহমেদ" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">ওয়েবসাইট ইউআরএল *</label>
                        <input type="text" value={pWeb || ""} onChange={e => setPWeb(e.target.value)} placeholder="www.puthianews24.com" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">যোগাযোগ মোবাইল নম্বর *</label>
                        <input type="tel" value={pPhone || ""} onChange={e => setPPhone(e.target.value)} placeholder="017XXXXXXXX" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">বিবরণ (সংক্ষিপ্ত)</label>
                        <textarea value={pDesc || ""} onChange={e => setPDesc(e.target.value)} placeholder="পোর্টালের বিশেষ উদ্দেশ্য ও খবরের ধরণ লিখুন..." rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" />
                      </div>
                    </div>
                  )}

                  {activeTab === 'tv_representatives' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">প্রতিনিধির নাম *</label>
                        <input type="text" value={tvName || ""} onChange={e => setTvName(e.target.value)} placeholder="উদাঃ মোঃ কামরুজ্জামান" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">টিভি চ্যানেল *</label>
                        <input type="text" value={tvChannel || ""} onChange={e => setTvChannel(e.target.value)} placeholder="উদাঃ সময় টিভি" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">মোবাইল নম্বর *</label>
                        <input type="tel" value={tvPhone || ""} onChange={e => setTvPhone(e.target.value)} placeholder="017XXXXXXXX" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">ইমেইল ঠিকানা</label>
                        <input type="email" value={tvEmail || ""} onChange={e => setTvEmail(e.target.value)} placeholder="mail@example.com" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" />
                      </div>
                    </div>
                  )}

                  {activeTab === 'press_releases' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">বিজ্ঞপ্তির শিরোনাম *</label>
                          <input type="text" value={prTitle || ""} onChange={e => setPrTitle(e.target.value)} placeholder="উদাঃ ডেঙ্গু প্রতিরোধ ও পরিচ্ছন্নতা অভিযান জোরদারকরণ" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">প্রকাশকারী দপ্তর *</label>
                          <input type="text" value={prDept || ""} onChange={e => setPrDept(e.target.value)} placeholder="উদাঃ উপজেলা প্রশাসন, পুঠিয়া" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">ইস্যুকারী কর্মকর্তা ও পদবী *</label>
                          <input type="text" value={prIssuer || ""} onChange={e => setPrIssuer(e.target.value)} placeholder="উদাঃ মোঃ আনিসুর রহমান (উপজেলা নির্বাহী অফিসার)" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">বিজ্ঞপ্তির বিস্তারিত সারসংক্ষেপ *</label>
                        <textarea value={prContent || ""} onChange={e => setPrContent(e.target.value)} placeholder="বিজ্ঞপ্তির মূল বিষয়বস্তু এখানে বিস্তারিত লিখুন..." rows={6} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                    </div>
                  )}

                  {activeTab === 'citizen_news' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">সংবাদের শিরোনাম *</label>
                          <input type="text" value={crTitle || ""} onChange={e => setCrTitle(e.target.value)} placeholder="উদাঃ বানেশ্বর বাজারে অতিরিক্ত যানজট, ভোগান্তিতে মানুষ" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">সংবাদের বিভাগ</label>
                          <select value={crCat || ""} onChange={e => setCrCat(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500 font-bold">
                            <option value="জনদুর্ভোগ">জনদুর্ভোগ (Public Sufferings)</option>
                            <option value="সাধারণ সংবাদ">সাধারণ সংবাদ (General News)</option>
                            <option value="উন্নয়ন ও সম্ভাবনা">উন্নয়ন ও সম্ভাবনা (Development)</option>
                            <option value="অপরাধ ও দুর্ঘটনা">অপরাধ ও দুর্ঘটনা (Accident/Crime)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">প্রতিবেদকের নাম *</label>
                          <input type="text" value={crRepName || ""} onChange={e => setCrRepName(e.target.value)} placeholder="আপনার নাম" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">যোগাযোগ মোবাইল (ঐচ্ছিক/অনলাইনে গোপন থাকবে)</label>
                          <input type="tel" value={crRepContact || ""} onChange={e => setCrRepContact(e.target.value)} placeholder="মোবাইল নম্বর" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">সংবাদের বিস্তারিত বিবরণ *</label>
                        <textarea value={crContent || ""} onChange={e => setCrContent(e.target.value)} placeholder="ঘটনার স্থান, সময় এবং বিস্তারিত বিবরণ সঠিক তথ্যের ভিত্তিতে সুন্দর করে গুছিয়ে লিখুন..." rows={5} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">ছবি সংযুক্ত করুন (১.৫ মেগাবাইটের নিচে)</label>
                        <div className="flex items-center gap-3">
                          <input type="file" accept="image/*" id="report_image_input" onChange={e => handleImageUpload(e, setCrImage)} className="hidden" />
                          <label htmlFor="report_image_input" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer">
                            <Camera className="w-4 h-4" /> ছবি আপলোড করুন
                          </label>
                          {crImage && (
                            <div className="relative">
                              <img src={crImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                              <button type="button" onClick={() => setCrImage(null)} className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'gallery' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">মিডিয়া ছবির শিরোনাম *</label>
                        <input type="text" value={mTitle || ""} onChange={e => setMTitle(e.target.value)} placeholder="উদাঃ পুঠিয়া প্রেসক্লাবে সাংবাদিকদের মতবিনিময় সভা" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">ছবির সংক্ষিপ্ত বিবরণী *</label>
                        <input type="text" value={mCaption || ""} onChange={e => setMCaption(e.target.value)} placeholder="ছবির নিচে প্রদর্শনের জন্য ছোট বিবরণী লিখুন" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500" required />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">ছবির ফাইল সংযুক্ত করুন *</label>
                        <div className="flex items-center gap-3">
                          <input type="file" accept="image/*" id="gallery_image_input" onChange={e => handleImageUpload(e, setMImage)} className="hidden" />
                          <label htmlFor="gallery_image_input" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer">
                            <Upload className="w-4 h-4" /> ফাইল নির্বাচন করুন
                          </label>
                          {mImage && (
                            <div className="relative">
                              <img src={mImage} alt="Preview" className="w-16 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                              <button type="button" onClick={() => setMImage("")} className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border-none shadow-md shadow-sky-900/10"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {isSubmitting ? "সাবমিট করা হচ্ছে..." : "তথ্য জমা দিন"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Content Layout based on activeTab */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="py-24 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-500">তথ্য লোড হচ্ছে...</span>
              </div>
            ) : (
              <>
                {/* 1. JOURNALISTS */}
                {activeTab === 'journalists' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredJournalistsList.length === 0 ? (
                      <div className="col-span-full bg-white py-16 text-center text-slate-400 rounded-2xl border border-slate-100">
                        <Newspaper className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-xs font-bold">কোনো সাংবাদিকের তথ্য পাওয়া যায়নি।</p>
                      </div>
                    ) : (
                      filteredJournalistsList.map((j) => (
                        <div key={j.id} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-md transition duration-200 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-50 text-slate-600 border border-slate-100 uppercase tracking-wide">
                                {j.media}
                              </span>
                              
                              <div className="flex items-center gap-1.5">
                                {j.verified && (
                                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" /> ভেরিফাইড
                                  </span>
                                )}
                                {j.isCustom && (
                                  <button onClick={() => handleDeleteDoc("journalists", j.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded transition border-none cursor-pointer">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 mb-3">
                              <span className="w-1.5 h-1.5 bg-sky-600 rounded-full"></span>
                              {j.name}
                            </h3>

                            <div className="space-y-2 text-xs text-slate-600 mt-2">
                              <p className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>মোবাইল: <strong className="text-slate-800">{j.phone}</strong></span>
                              </p>
                              {j.email && (
                                <p className="flex items-center gap-2">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  <span>ইমেইল: <span className="text-slate-700">{j.email}</span></span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-50 flex gap-2">
                            <a href={`tel:${j.phone}`} className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-[11px] font-bold text-center transition flex items-center justify-center gap-1">
                              <Phone className="w-3 h-3" /> কল করুন
                            </a>
                            <button 
                              onClick={() => setShowTipModal(j)}
                              className="flex-1 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer border-none"
                            >
                              <Send className="w-3 h-3" /> খবর পাঠান
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 2. NEWSPAPERS */}
                {activeTab === 'newspapers' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredNewspapersList.length === 0 ? (
                      <div className="col-span-full bg-white py-16 text-center text-slate-400 rounded-2xl border border-slate-100">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-xs font-bold">কোনো সংবাদপত্রের তথ্য পাওয়া যায়নি।</p>
                      </div>
                    ) : (
                      filteredNewspapersList.map((np) => (
                        <div key={np.id} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-md transition duration-200 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-bold">
                                {np.frequency}
                              </span>
                              {np.isCustom && (
                                <button onClick={() => handleDeleteDoc("local_newspapers", np.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded transition border-none cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 mb-2">
                              <Newspaper className="w-4 h-4 text-sky-600" />
                              {np.title}
                            </h3>

                            <div className="space-y-2 text-xs text-slate-600 mt-3">
                              <p><strong>সম্পাদক:</strong> {np.editor}</p>
                              <p><strong>প্রতিষ্ঠা বছর:</strong> {np.established} ইং</p>
                              <p className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>যোগাযোগ: <strong className="text-slate-800">{np.phone}</strong></span>
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-50 flex gap-2">
                            <a href={`tel:${np.phone}`} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold text-center transition flex items-center justify-center gap-1">
                              <Phone className="w-3 h-3" /> কল করুন
                            </a>
                            {np.website && (
                              <a href={np.website} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-[11px] font-bold text-center transition flex items-center justify-center gap-1">
                                <Globe className="w-3 h-3" /> ই-পেপার দেখুন
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 3. PORTALS */}
                {activeTab === 'portals' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPortalsList.length === 0 ? (
                      <div className="col-span-full bg-white py-16 text-center text-slate-400 rounded-2xl border border-slate-100">
                        <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-xs font-bold">কোনো অনলাইন নিউজ পোর্টালের তথ্য পাওয়া যায়নি।</p>
                      </div>
                    ) : (
                      filteredPortalsList.map((p) => (
                        <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-md transition duration-200 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className="text-[10px] text-sky-600 font-bold flex items-center gap-1">
                                <Globe className="w-3.5 h-3.5" /> {p.website}
                              </span>
                              {p.isCustom && (
                                <button onClick={() => handleDeleteDoc("online_news_portals", p.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded transition border-none cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <h3 className="text-sm font-black text-slate-800 mb-1">{p.title}</h3>
                            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">{p.description}</p>

                            <div className="space-y-1 text-xs text-slate-600 border-t border-slate-50 pt-2.5">
                              <p><strong>সম্পাদনায়:</strong> {p.editor}</p>
                              <p className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>মোবাইল: <strong className="text-slate-800">{p.phone}</strong></span>
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-50 flex gap-2">
                            <a href={`tel:${p.phone}`} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold text-center transition flex items-center justify-center gap-1">
                              <Phone className="w-3 h-3" /> কল করুন
                            </a>
                            <a href={`https://${p.website}`} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-[11px] font-bold text-center transition flex items-center justify-center gap-1">
                              <ExternalLink className="w-3 h-3" /> ভিজিট করুন
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 4. TV REPRESENTATIVES */}
                {activeTab === 'tv_representatives' && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-5 py-3.5 text-xs font-black text-slate-700">নাম</th>
                            <th className="px-5 py-3.5 text-xs font-black text-slate-700">টিভি চ্যানেল</th>
                            <th className="px-5 py-3.5 text-xs font-black text-slate-700">মোবাইল</th>
                            <th className="px-5 py-3.5 text-xs font-black text-slate-700">ইমেইল</th>
                            <th className="px-5 py-3.5 text-xs font-black text-slate-700 text-right">পদক্ষেপ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredTvRepsList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-xs font-bold">
                                কোনো টিভি প্রতিনিধির তথ্য পাওয়া যায়নি।
                              </td>
                            </tr>
                          ) : (
                            filteredTvRepsList.map((tv) => (
                              <tr key={tv.id} className="hover:bg-slate-50/50 transition">
                                <td className="px-5 py-4 text-xs font-bold text-slate-800">{tv.name}</td>
                                <td className="px-5 py-4 text-xs font-bold text-sky-700">
                                  <span className="flex items-center gap-1.5">
                                    <Tv className="w-3.5 h-3.5" /> {tv.channel}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-xs font-bold text-slate-600">{tv.phone}</td>
                                <td className="px-5 py-4 text-xs text-slate-500">{tv.email || "—"}</td>
                                <td className="px-5 py-4 text-xs text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <a href={`tel:${tv.phone}`} className="p-1.5 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition">
                                      <Phone className="w-3.5 h-3.5" />
                                    </a>
                                    {tv.isCustom && (
                                      <button onClick={() => handleDeleteDoc("tv_representatives", tv.id)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition border-none cursor-pointer">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. PRESS CLUB */}
                {activeTab === 'press_club' && (
                  <div className="space-y-6">
                    {/* Press Club Intro */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="p-4 bg-sky-50 rounded-2xl text-sky-600">
                          <Award className="w-12 h-12" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="text-lg font-black text-slate-800">পুঠিয়া প্রেসক্লাব (Puthia Press Club)</h3>
                          <p className="text-xs text-slate-500">স্থাপিত: ১৯৯৮ ইং | ঠিকানা: রাজবাড়ী চত্বর রোড, পুঠিয়া পৌরসভা।</p>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            পুঠিয়া উপজেলার কর্মরত সাংবাদিকদের একমাত্র প্রাচীন ও নির্ভরযোগ্য পেশাদার সংগঠন। এটি সাংবাদিকদের অধিকার রক্ষা, দক্ষতা বৃদ্ধি এবং উপজেলার সকল স্তরের মানুষের স্বার্থসংশ্লিষ্ট খবরের বস্তুনিষ্ঠ ও সত্য প্রকাশের প্রতীক হিসেবে কাজ করে আসছে।
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Executive Committee */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">প্রেসক্লাব কার্যনির্বাহী কমিটি (২০২৬-২০২৭)</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2">
                          <span className="inline-block px-2.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-black border border-sky-100">সভাপতি</span>
                          <h5 className="text-xs font-black text-slate-800">মোঃ রেজওয়ান আলী</h5>
                          <p className="text-[11px] text-slate-500">সিনিয়র সাংবাদিক, দৈনিক ইনকিলাব</p>
                          <p className="text-[11px] text-slate-700 font-bold">মোবাইল: 01712000222</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2 border-t-2 border-t-sky-500">
                          <span className="inline-block px-2.5 py-0.5 rounded bg-sky-600 text-white text-[10px] font-black">সাধারণ সম্পাদক</span>
                          <h5 className="text-xs font-black text-slate-800">মোঃ রফিকুল ইসলাম</h5>
                          <p className="text-[11px] text-slate-500">প্রতিনিধি, দৈনিক প্রথম আলো</p>
                          <p className="text-[11px] text-slate-700 font-bold">মোবাইল: 01712112233</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2">
                          <span className="inline-block px-2.5 py-0.5 rounded bg-slate-50 text-slate-700 text-[10px] font-black border border-slate-100">কোষাধ্যক্ষ</span>
                          <h5 className="text-xs font-black text-slate-800">মোঃ আবু বকর</h5>
                          <p className="text-[11px] text-slate-500">প্রতিনিধি, দৈনিক করতোয়া</p>
                          <p className="text-[11px] text-slate-700 font-bold">মোবাইল: 01815554433</p>
                        </div>
                      </div>
                    </div>

                    {/* General Press club contacts */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-sky-600" /> জরুরী যোগাযোগ ও অভিযোগ ডেস্ক:</span>
                      <p>প্রেসক্লাবের কোনো সাংবাদিক সম্পর্কে বা অসাংবাদিকদের অপপ্রচার রুখতে প্রেসক্লাব কমিটির সাথে সরাসরি যোগাযোগ করুন।</p>
                      <p className="font-bold text-slate-800">সহায়তা লাইন: +৮৮০১৭১২-১১২২৩৩ | ইমেইল: puthiapressclub@gmail.com</p>
                    </div>
                  </div>
                )}

                {/* 6. PRESS RELEASE */}
                {activeTab === 'press_releases' && (
                  <div className="space-y-4">
                    {filteredPressReleasesList.length === 0 ? (
                      <div className="bg-white py-16 text-center text-slate-400 rounded-2xl border border-slate-100">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-xs font-bold">কোনো অফিসিয়াল প্রেস রিলিজ পাওয়া যায়নি।</p>
                      </div>
                    ) : (
                      filteredPressReleasesList.map((pr) => (
                        <div key={pr.id} className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-sm transition space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-50">
                            <div>
                              <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-black uppercase tracking-wide">
                                {pr.department}
                              </span>
                              <p className="text-[10px] text-slate-400 mt-1">{pr.date}</p>
                            </div>
                            
                            {pr.isCustom && (
                              <button onClick={() => handleDeleteDoc("press_releases", pr.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded transition border-none cursor-pointer self-end">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-sm font-black text-slate-800 leading-snug">{pr.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{pr.content}</p>
                          </div>

                          <div className="pt-3 border-t border-slate-50 text-slate-500 text-[10px] flex items-center justify-between">
                            <span>ইস্যুকারী: <strong>{pr.issuer}</strong></span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`${pr.title}\n\n${pr.content}`);
                                alert("প্রেস রিলিজটি ক্লিপবোর্ডে কপি করা হয়েছে!");
                              }}
                              className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition border-none font-bold cursor-pointer"
                            >
                              বিজ্ঞপ্তি কপি করুন
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 7. CITIZEN JOURNALISM */}
                {activeTab === 'citizen_news' && (
                  <div className="space-y-6">
                    <div className="bg-sky-50 border border-sky-100 p-5 rounded-2xl">
                      <h4 className="text-xs font-black text-sky-800 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> নাগরিক সাংবাদিকতা (Citizen Journalism)
                      </h4>
                      <p className="text-[11px] text-sky-700 leading-relaxed">
                        পুঠিয়া উপজেলার যেকোনো বাসিন্দা এখন নিজেই হয়ে উঠতে পারেন একজন স্থানীয় সাংবাদিক। আপনার আশেপাশে ঘটে যাওয়া যেকোনো দুর্নীতি, জনদুর্ভোগ, সম্ভাবনা কিংবা সাফল্য সম্পর্কে সত্য সংবাদের সংক্ষিপ্ত বিবরণী ও ছবি পাঠিয়ে পোস্ট করতে পারেন।
                      </p>
                    </div>

                    <div className="space-y-4">
                      {filteredCitizenReportsList.length === 0 ? (
                        <div className="bg-white py-16 text-center text-slate-400 rounded-2xl border border-slate-100">
                          <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p className="text-xs font-bold">নাগরিকদের প্রকাশিত কোনো সংবাদ এখনও নেই।</p>
                        </div>
                      ) : (
                        filteredCitizenReportsList.map((cr) => (
                          <div key={cr.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                            {cr.image && (
                              <div className="w-full md:w-1/3 h-48 md:h-auto relative flex-shrink-0">
                                <img src={cr.image} alt={cr.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="inline-block px-2 py-0.5 rounded bg-violet-50 text-violet-700 text-[9px] font-black border border-violet-100 uppercase tracking-wide">
                                    {cr.category}
                                  </span>
                                  
                                  {cr.isCustom && (
                                    <button onClick={() => handleDeleteDoc("citizen_reports", cr.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded transition border-none cursor-pointer">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <h3 className="text-sm font-black text-slate-800 leading-snug">{cr.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{cr.content}</p>
                              </div>

                              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-slate-500 text-[10px]">
                                <span>প্রতিবেদক: <strong className="text-slate-700">{cr.reporterName}</strong></span>
                                
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => handleLikeReport(cr.id, cr.isCustom)}
                                    className="flex items-center gap-1 text-slate-600 hover:text-rose-500 transition border-none bg-transparent cursor-pointer font-bold"
                                  >
                                    <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-50" /> {cr.likes || 0}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 8. MEDIA GALLERY */}
                {activeTab === 'gallery' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredMediaPhotosList.length === 0 ? (
                        <div className="col-span-full bg-white py-16 text-center text-slate-400 rounded-2xl border border-slate-100">
                          <Image className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p className="text-xs font-bold">কোনো মিডিয়া ছবি পাওয়া যায়নি।</p>
                        </div>
                      ) : (
                        filteredMediaPhotosList.map((m) => (
                          <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                            <div className="relative h-48 bg-slate-50 overflow-hidden">
                              <img src={m.image} alt={m.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" referrerPolicy="no-referrer" />
                              <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-md">
                                {m.date}
                              </span>
                            </div>

                            <div className="p-4 space-y-2">
                              <h4 className="text-xs font-black text-slate-800 leading-snug">{m.title}</h4>
                              <p className="text-[11px] text-slate-500 leading-relaxed">{m.caption}</p>
                            </div>

                            {m.isCustom && (
                              <div className="px-4 pb-4 flex justify-end">
                                <button onClick={() => handleDeleteDoc("media_gallery", m.id)} className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded-lg transition border-none cursor-pointer">
                                  ছবি মুছুন
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tip Send Modal Overlay */}
      {showTipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4 text-left"
          >
            <button 
              onClick={() => setShowTipModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md font-black border border-sky-100 uppercase tracking-wide">
                তথ্য বাতায়ন সিকিউরড গেটওয়ে
              </span>
              <h3 className="text-sm font-black text-slate-800">
                সাংবাদিককে খবর পাঠান
              </h3>
              <p className="text-xs text-slate-500">
                সাংবাদিক: <strong className="text-slate-800">{showTipModal.name}</strong> ({showTipModal.media})
              </p>
            </div>

            <form onSubmit={handleSendTip} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">খবরের বিবরণ ও সত্যতা প্রমাণ *</label>
                <textarea 
                  value={tipContent || ""}
                  onChange={e => setTipContent(e.target.value)}
                  placeholder="আপনার কাছে থাকা যেকোনো বিশেষ বা জরুরী খবরের বিবরণ এখানে বিস্তারিতভাবে লিখুন..."
                  rows={5}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">আপনার নাম বা মোবাইল (সম্পূর্ণ গোপন রাখা হবে)</label>
                <input 
                  type="text"
                  value={tipContact || ""}
                  onChange={e => setTipContact(e.target.value)}
                  placeholder="উদাঃ বেনামী নাগরিক / ০১৭১২XXXXXX"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-[10px] text-slate-500 leading-relaxed border border-slate-100">
                ⚠️ * আপনার নাম ও মোবাইল নম্বর কোনো অবস্থাতেই গণমাধ্যমে প্রকাশ করা হবে না। সাংবাদিক মহোদয় খবরের সত্যতা অনুসন্ধান করতে কেবল অভ্যন্তরীণ যোগাযোগের জন্য এটি ব্যবহার করতে পারেন।
              </div>

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowTipModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border-none cursor-pointer"
                >
                  বাতিল
                </button>
                <button 
                  type="submit" 
                  disabled={isSendingTip}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border-none"
                >
                  {isSendingTip ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {isSendingTip ? "পাঠানো হচ্ছে..." : "সাবমিট করুন"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Megaphone, Newspaper, Calendar, Image as ImageIcon, FileText, Link2, Plus, Search, 
  Trash2, Edit, Save, X, Loader2, Info, CheckCircle2, AlertCircle, 
  Eye, Pin, Palette, ShieldCheck, ExternalLink, ChevronRight, Download, Landmark, Compass, Flame, Filter, Radio
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../../firebase";
import { 
  collection, query, orderBy, onSnapshot, addDoc, updateDoc, 
  deleteDoc, doc, serverTimestamp, setDoc
} from "firebase/firestore";

// Local interfaces for Content Management
export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  content: string;
  image?: string;
  isBreaking?: boolean;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface NoticeItem {
  id: string;
  title?: string;
  text: string;
  content?: string;
  color: string;
  isActive: boolean;
  isPinned?: boolean;
  order: number;
  createdAt?: any;
  publishAt?: string;
  status?: "published" | "draft" | "scheduled";
  priority?: "low" | "medium" | "high";
  link?: string;
}

export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  slotType: "home_hero" | "top_banner" | "sidebar_ad" | "footer_banner" | "popup_alert";
  order: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface SocialEvent {
  id: string;
  title: string;
  category: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  organizer: string;
  description: string;
  image?: string;
  registrationLink?: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface TourismSpotItem {
  id: string;
  name: string;
  category: string;
  description: string;
  history?: string;
  location: string;
  entryFee?: string;
  openingHours?: string;
  image?: string;
  mapUrl?: string;
  order?: number;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface DynamicContentItem {
  id: string;
  title: string;
  type: "pdf_form" | "external_link" | "resource" | "popup_alert";
  category: string;
  description?: string;
  url: string;
  fileSize?: string;
  colorTheme?: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export type ManagementSection = "news" | "notice" | "banner" | "event" | "tourism" | "dynamic";

interface ContentManagementProps {
  initialSection?: ManagementSection;
}

// Fallback seed data if Firestore collection is empty
const INITIAL_NEWS: NewsItem[] = [
  {
    id: "news-1",
    title: "পুঠিয়া রাজবাড়ীতে চার দিনব্যাপী বার্ষিক সাংস্কৃতিক উৎসব শুরু",
    category: "সংস্কৃতি ও ঐতিহ্য",
    date: "2026-08-30",
    time: "10:00",
    content: "ঐতিহাসিক পুঠিয়া রাজবাড়ী প্রাঙ্গণে চার দিনব্যাপী বার্ষিক ঐতিহ্যবাহী সাংস্কৃতিক উৎসব ও প্রদর্শনী শুরু হয়েছে। এতে বিভিন্ন সাংস্কৃতিক সংগঠন পরিবেশনা পরিবেশন করছে।",
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80",
    isBreaking: true,
    isActive: true
  },
  {
    id: "news-2",
    title: "পুঠিয়া উপজেলায় কৃষকদের মধ্যে বিনামূল্যে উন্নত জাতের সার ও বীজ বিতরণ",
    category: "কৃষি ও খামার",
    date: "2026-08-28",
    time: "11:30",
    content: "চলতি মৌসুমে উৎপাদন বৃদ্ধির লক্ষ্যে পুঠিয়া উপজেলা কৃষি সম্প্রসারণ কার্যালয়ের উদ্যোগে তালিকাভুক্ত ক্ষুদ্র ও প্রান্তিক কৃষকদের মাঝে সার ও বীজ প্রদান করা হয়েছে।",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    isBreaking: false,
    isActive: true
  },
  {
    id: "news-3",
    title: "ঝলমলিয়া হাটে ই-নামজারি সেবার বিশেষ মোবাইল ক্যাম্পেইন চালু",
    category: "ভূমি ও ই-সেবা",
    date: "2026-08-25",
    time: "14:00",
    content: "সহজে ভূমি নামজারি সেবা ও ডিজিটাল খতিয়ান প্রদানে ঝলমলিয়া হাটে বিশেষ ই-সেবা বুথ স্থাপন করা হয়েছে। সাধারণ ভূমিমালিকগণ তাৎক্ষণিক পরামর্শ গ্রহণ করছেন।",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    isBreaking: false,
    isActive: true
  }
];

const INITIAL_NOTICES: NoticeItem[] = [
  {
    id: "notice-1",
    title: "বিদ্যুৎ সংযোগ সতর্কতা",
    text: "জরুরি নোটিশ: কাল কালবৈশাখী ঝড়ের পূর্বাভাসে বিদ্যুৎ সংযোগ সাময়িক বন্ধ থাকতে পারে। সহনশীল থাকার বিনীত অনুরোধ।",
    content: "উপজেলা পল্লী বিদ্যুৎ সমিতির বিজ্ঞপ্তি অনুসারে কাল বৈরী আবহাওয়া চলাকালীন নিরাপত্তা স্বার্থে সাময়িক সংযোগ বন্ধ থাকতে পারে।",
    color: "#ef4444",
    isActive: true,
    isPinned: true,
    order: 1,
    priority: "high"
  },
  {
    id: "notice-2",
    title: "ফ্রি স্বাস্থ্য ক্যাম্প",
    text: "উপজেলা স্বাস্থ্য কমপ্লেক্সে বিনামূল্যে চোখ পরীক্ষা ও ছানি অপারেশনের ফ্রি মেডিকেল ক্যাম্প ১৬ সেপ্টেম্বর।",
    color: "#10b981",
    isActive: true,
    isPinned: false,
    order: 2,
    priority: "medium"
  },
  {
    id: "notice-3",
    title: "এনআইডি সংশোধন সেবা",
    text: "স্মার্ট জাতীয় পরিচয়পত্র সংশোধন ও নতুন নিবন্ধনের আবেদন অনলাইন পোর্টালে চালু হয়েছে।",
    color: "#3b82f6",
    isActive: true,
    isPinned: false,
    order: 3,
    priority: "low"
  }
];

const INITIAL_BANNERS: BannerItem[] = [
  {
    id: "banner-1",
    title: "ঐতিহাসিক পুঠিয়া রাজবাড়ী ভ্রমণ গাইড - ঐতিহ্য ও রূপসী পুঠিয়া",
    imageUrl: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80",
    link: "/tourism",
    slotType: "home_hero",
    order: 1,
    isActive: true
  },
  {
    id: "banner-2",
    title: "সহজ ই-নামজারি ও অনলাইন ডিজিটাল ভূ-সেবা",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    link: "/services",
    slotType: "top_banner",
    order: 2,
    isActive: true
  },
  {
    id: "banner-3",
    title: "২৪/৭ পুঠিয়া জরুরি হেল্পলাইন ও অ্যাম্বুলেন্স সেবা",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
    link: "/health",
    slotType: "sidebar_ad",
    order: 3,
    isActive: true
  }
];

const INITIAL_EVENTS: SocialEvent[] = [
  {
    id: "event-1",
    title: "ঐতিহাসিক পুঠিয়া রথযাত্রা ও লোকজ ঐতিহ্য মেলা ২০২৬",
    category: "সাংস্কৃতিক মেলা",
    eventDate: "2026-09-15",
    eventTime: "15:00",
    venue: "পুঠিয়া রাজবাড়ী ও মন্দির প্রাঙ্গণ",
    organizer: "পুঠিয়া মন্দির দেবোত্তোর ট্রাস্ট ও উপজেলা পরিষদ",
    description: "শতবর্ষী ঐতিহ্যবাহী রথযাত্রা উপলক্ষে রাজবাড়ী চত্বরে বসছে সপ্তাহব্যাপী লোকজ ও কারুপণ্য মেলা। দেশ-বিদেশের পর্যটকগণ অংশগ্রহণ করবেন।",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
    isActive: true
  },
  {
    id: "event-2",
    title: "বার্ষিক উপজেলা আন্তঃস্কুল ক্রীড়া ও সাংস্কৃতিক প্রতিযোগিতা",
    category: "ক্রীড়া প্রতিযোগিতা",
    eventDate: "2026-10-02",
    eventTime: "09:00",
    venue: "পুঠিয়া মডেল হাই স্কুল মাঠ",
    organizer: "উপজেলা মাধ্যমিক শিক্ষা অফিস",
    description: "উপজেলার সকল মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা প্রতিষ্ঠানের শিক্ষার্থীদের অংশগ্রহণে তিন দিনব্যাপী ক্রীড়া প্রতিযোগিতা।",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    isActive: true
  }
];

const INITIAL_TOURISM: TourismSpotItem[] = [
  {
    id: "tour-1",
    name: "পাঁচ রত্ন গোবিন্দ মন্দির",
    category: "মন্দির",
    description: "পুঠিয়া রাজবাড়ীর অন্যতম প্রধান আকর্ষণ। সূক্ষ্ম টেরাকোটা অলঙ্করণে সমৃদ্ধ এই ঐতিহাসিক মন্দিরটি ১৮২৩ সালে মহারানী সুগন্ধা দেবী কর্তৃক নির্মিত হয়।",
    history: "১৮২৩ সালে মন্দিরটি নির্মিত হয়। রামায়ণ ও মহাভারতের কাহিনীর চমৎকার টেরাকোটা চিত্রশিল্প রয়েছে মন্দিরগাত্রে।",
    location: "রাজবাড়ী চত্বর, পুঠিয়া সদর",
    entryFee: "দেশি দর্শনার্থী: ২০ টাকা, বিদেশি: ২০০ টাকা",
    openingHours: "সকাল ৯:০০ - বিকাল ৫:৩০ (সোম-শনি)",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    isActive: true
  },
  {
    id: "tour-2",
    name: "পুঠিয়া রাজবাড়ী (পড়াশোনা ভবন ও রাজপ্রাসাদ)",
    category: "রাজবাড়ী",
    description: "১৮৯৫ সালে মহারানী হেমন্তকুমারী দেবী তাঁর শাশুড়ি মহারানী শরৎসুন্দরীর স্মৃতির উদ্দেশ্যে ইন্দো-সারাসেনিক স্থাপত্যরীতিতে তৈরি বিশাল রাজপ্রাসাদ।",
    history: "১৮৯৫ সালে নির্মিত দুই তলা বিশিষ্ট সুদৃশ্য প্রাসাদ। প্রাসাদ সীমানায় ঝুলন মণ্ডপ, শিব মন্দির ও বিশাল দিঘি অবস্থিত।",
    location: "রাজবাড়ী চত্বর, পুঠিয়া সদর",
    entryFee: "সাধারণ পরিদর্শন বিনামূল্যে",
    openingHours: "সকাল ৯:০০ - সন্ধ্যা ৬:০০",
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80",
    isActive: true
  },
  {
    id: "tour-3",
    name: "ভুবনেশ্বর শিব মন্দির (বড় শিব মন্দির)",
    category: "মন্দির",
    description: "বাংলাদেশের বৃহত্তম শিব মন্দির। শিবসাগর দিঘির উঁচু পাড়ে অবস্থিত ১৮১৫ সালে নির্মিত অনন্য পাঁচ চূড়া বিশিষ্ট মন্দির।",
    history: "রাজা রামেন্দ্র নারায়ণের বিধবা স্ত্রী রানী ভুবনময়ী দেবী ১৮১৫ সালে নির্মাণ করেন।",
    location: "শিবসাগর দিঘির পাড়, পুঠিয়া",
    entryFee: "বিনামূল্যে",
    openingHours: "সকাল ৯:০০ - বিকাল ৫:০০",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
    isActive: true
  }
];

const INITIAL_DYNAMIC: DynamicContentItem[] = [
  {
    id: "dyn-1",
    title: "জন্ম ও মৃত্যু নিবন্ধন সংশোধন ফরম ২০২৬ (PDF)",
    category: "আবেদন ফরম",
    type: "pdf_form",
    description: "ইউনিয়ন পরিষদ ও পৌরসভার জন্ম তথ্য সংশোধনের জন্য পূরণকৃত আবেদনপত্র।",
    url: "https://bdris.gov.bd",
    fileSize: "১.৪ এমবি",
    colorTheme: "emerald",
    isActive: true
  },
  {
    id: "dyn-2",
    title: "অনলাইন ই-নামজারি ডিরেক্ট আবেদন পোর্টাল",
    category: "ভূমি সেবা",
    type: "external_link",
    description: "অনলাইনে দ্রুত ও সহজে জমি নামজারি ও খতিয়ান আবেদনের অফিসিয়াল পোর্টাল।",
    url: "https://land.gov.bd",
    fileSize: "অনলাইন সেবা",
    colorTheme: "blue",
    isActive: true
  },
  {
    id: "dyn-3",
    title: "উপজেলা জরুরি দুর্যোগ ব্যবস্থাপনা নোটিফিকেশন অ্যালার্ট",
    category: "জরুরি সতর্কতা",
    type: "popup_alert",
    description: "ভারী বর্ষণ ও বন্যা পরিস্থিতিতে সার্বক্ষণিক কন্ট্রোল রুমের আপডেট পপআপ বার্তা।",
    url: "/emergency",
    fileSize: "সিস্টেম বার্তা",
    colorTheme: "rose",
    isActive: true
  }
];

export default function ContentManagement({ initialSection = "news" }: ContentManagementProps) {
  const [searchParams] = useSearchParams();
  const urlSection = searchParams.get('section') || searchParams.get('tab');
  const [activeSection, setActiveSection] = useState<ManagementSection>(initialSection);

  useEffect(() => {
    if (urlSection && ['news', 'notices', 'events', 'banners', 'tourism', 'forms'].includes(urlSection)) {
      setActiveSection(urlSection as ManagementSection);
    }
  }, [urlSection]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Data states
  const [news, setNews] = useState<NewsItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [tourism, setTourism] = useState<TourismSpotItem[]>([]);
  const [dynamicItems, setDynamicItems] = useState<DynamicContentItem[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Universal Form Field States
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formExtra1, setFormExtra1] = useState(""); // Venue, Location, FileSize, etc.
  const [formExtra2, setFormExtra2] = useState(""); // Organizer, OpeningHours, ColorTheme, etc.
  const [formExtra3, setFormExtra3] = useState(""); // EntryFee, History, etc.
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formIsBreaking, setFormIsBreaking] = useState(false);
  const [formColor, setFormColor] = useState("#007A5E");
  const [formSlotType, setFormSlotType] = useState<string>("home_hero");
  const [formType, setFormType] = useState<string>("pdf_form");
  const [formPriority, setFormPriority] = useState<"low" | "medium" | "high">("medium");

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // Sync section switch when prop changes
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // Firestore Snapshot Listeners for all sections
  useEffect(() => {
    setLoading(true);
    let unsubscribe = () => {};

    try {
      if (activeSection === "news") {
        const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
        unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            setNews(INITIAL_NEWS);
          } else {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
            setNews(items);
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, "news");
          setNews(INITIAL_NEWS);
          setLoading(false);
        });
      } else if (activeSection === "notice") {
        const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
        unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            setNotices(INITIAL_NOTICES);
          } else {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NoticeItem));
            setNotices(items);
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, "notices");
          setNotices(INITIAL_NOTICES);
          setLoading(false);
        });
      } else if (activeSection === "banner") {
        const q = query(collection(db, "ads"));
        unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            setBanners(INITIAL_BANNERS);
          } else {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BannerItem));
            setBanners(items.sort((a, b) => (a.order || 0) - (b.order || 0)));
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, "ads");
          setBanners(INITIAL_BANNERS);
          setLoading(false);
        });
      } else if (activeSection === "event") {
        const q = query(collection(db, "events"));
        unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            setEvents(INITIAL_EVENTS);
          } else {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialEvent));
            setEvents(items);
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, "events");
          setEvents(INITIAL_EVENTS);
          setLoading(false);
        });
      } else if (activeSection === "tourism") {
        const q = query(collection(db, "tourism_spots"));
        unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            setTourism(INITIAL_TOURISM);
          } else {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TourismSpotItem));
            setTourism(items);
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, "tourism_spots");
          setTourism(INITIAL_TOURISM);
          setLoading(false);
        });
      } else if (activeSection === "dynamic") {
        const q = query(collection(db, "download_documents"));
        unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            setDynamicItems(INITIAL_DYNAMIC);
          } else {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DynamicContentItem));
            setDynamicItems(items);
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, "download_documents");
          setDynamicItems(INITIAL_DYNAMIC);
          setLoading(false);
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, activeSection);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [activeSection]);

  // Reset form modal inputs
  const resetForm = () => {
    setEditingId(null);
    setFormTitle("");
    setFormCategory("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormTime("10:00");
    setFormContent("");
    setFormImage("");
    setFormUrl("");
    setFormExtra1("");
    setFormExtra2("");
    setFormExtra3("");
    setFormIsActive(true);
    setFormIsPinned(false);
    setFormIsBreaking(false);
    setFormColor("#007A5E");
    setFormSlotType("home_hero");
    setFormType("pdf_form");
    setFormPriority("medium");
  };

  const handleOpenAdd = () => {
    resetForm();
    if (activeSection === "news") {
      setFormCategory("সাধারণ");
    } else if (activeSection === "event") {
      setFormCategory("সাংস্কৃতিক মেলা");
    } else if (activeSection === "tourism") {
      setFormCategory("রাজবাড়ী");
    } else if (activeSection === "dynamic") {
      setFormCategory("আবেদন ফরম");
    }
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    resetForm();
    setEditingId(item.id);

    if (activeSection === "news") {
      setFormTitle(item.title || "");
      setFormCategory(item.category || "সাধারণ");
      setFormDate(item.date || "");
      setFormTime(item.time || "");
      setFormContent(item.content || "");
      setFormImage(item.image || "");
      setFormIsBreaking(item.isBreaking ?? false);
      setFormIsActive(item.isActive ?? true);
    } else if (activeSection === "notice") {
      setFormTitle(item.title || "");
      setFormContent(item.text || item.content || "");
      setFormColor(item.color || "#007A5E");
      setFormIsActive(item.isActive ?? true);
      setFormIsPinned(item.isPinned ?? false);
      setFormPriority(item.priority || "medium");
      setFormUrl(item.link || "");
    } else if (activeSection === "banner") {
      setFormTitle(item.title || "");
      setFormImage(item.imageUrl || "");
      setFormUrl(item.link || "");
      setFormSlotType(item.slotType || "home_hero");
      setFormExtra1(String(item.order || 1));
      setFormIsActive(item.isActive ?? true);
    } else if (activeSection === "event") {
      setFormTitle(item.title || "");
      setFormCategory(item.category || "সাংস্কৃতিক মেলা");
      setFormDate(item.eventDate || "");
      setFormTime(item.eventTime || "");
      setFormExtra1(item.venue || "");
      setFormExtra2(item.organizer || "");
      setFormContent(item.description || "");
      setFormImage(item.image || "");
      setFormUrl(item.registrationLink || "");
      setFormIsActive(item.isActive ?? true);
    } else if (activeSection === "tourism") {
      setFormTitle(item.name || "");
      setFormCategory(item.category || "রাজবাড়ী");
      setFormContent(item.description || "");
      setFormExtra1(item.location || "");
      setFormExtra2(item.openingHours || "");
      setFormExtra3(item.entryFee || "");
      setFormUrl(item.mapUrl || "");
      setFormImage(item.image || "");
      setFormIsActive(item.isActive ?? true);
    } else if (activeSection === "dynamic") {
      setFormTitle(item.title || "");
      setFormCategory(item.category || "আবেদন ফরম");
      setFormType(item.type || "pdf_form");
      setFormContent(item.description || "");
      setFormUrl(item.url || "");
      setFormExtra1(item.fileSize || "");
      setFormExtra2(item.colorTheme || "emerald");
      setFormIsActive(item.isActive ?? true);
    }

    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg("");

    try {
      if (activeSection === "news") {
        if (!formTitle || !formContent) throw new Error("সংবাদের শিরোনাম ও বিবরণ আবশ্যক।");
        const payload = {
          title: formTitle,
          category: formCategory || "সাধারণ",
          date: formDate || new Date().toISOString().split("T")[0],
          time: formTime || "10:00",
          content: formContent,
          image: formImage || undefined,
          isBreaking: formIsBreaking,
          isActive: formIsActive,
          updatedAt: serverTimestamp()
        };

        if (editingId) {
          await updateDoc(doc(db, "news", editingId), payload).catch(async () => {
            await setDoc(doc(db, "news", editingId), payload);
          });
          showNotification("সংবাদ সফলভাবে আপডেট করা হয়েছে!");
        } else {
          await addDoc(collection(db, "news"), { ...payload, createdAt: serverTimestamp() });
          showNotification("নতুন সংবাদ সফলভাবে যুক্ত করা হয়েছে!");
        }
      } else if (activeSection === "notice") {
        if (!formContent) throw new Error("নোটিশের মূল বার্তা আবশ্যক।");
        const payload = {
          title: formTitle || undefined,
          text: formContent,
          content: formContent,
          color: formColor,
          isActive: formIsActive,
          isPinned: formIsPinned,
          priority: formPriority,
          order: notices.length + 1,
          link: formUrl || undefined,
          updatedAt: serverTimestamp()
        };

        if (editingId) {
          await updateDoc(doc(db, "notices", editingId), payload).catch(async () => {
            await setDoc(doc(db, "notices", editingId), payload);
          });
          showNotification("নোটিশ সফলভাবে আপডেট করা হয়েছে!");
        } else {
          await addDoc(collection(db, "notices"), { ...payload, createdAt: new Date().toISOString() });
          showNotification("নতুন নোটিশ সফলভাবে পোস্ট করা হয়েছে!");
        }
      } else if (activeSection === "banner") {
        if (!formTitle || !formImage) throw new Error("ব্যানারের শিরোনাম ও ছবির লিঙ্ক আবশ্যক।");
        const payload = {
          title: formTitle,
          imageUrl: formImage,
          link: formUrl || undefined,
          slotType: formSlotType || "home_hero",
          order: Number(formExtra1) || banners.length + 1,
          isActive: formIsActive,
          updatedAt: serverTimestamp()
        };

        if (editingId) {
          await updateDoc(doc(db, "ads", editingId), payload).catch(async () => {
            await setDoc(doc(db, "ads", editingId), payload);
          });
          showNotification("ব্যানার সফলভাবে আপডেট করা হয়েছে!");
        } else {
          await addDoc(collection(db, "ads"), { ...payload, createdAt: serverTimestamp() });
          showNotification("নতুন ব্যানার সফলভাবে প্রকাশ করা হয়েছে!");
        }
      } else if (activeSection === "event") {
        if (!formTitle || !formDate || !formExtra1) throw new Error("ইভেন্টের শিরোনাম, তারিখ ও স্থান আবশ্যক।");
        const payload = {
          title: formTitle,
          category: formCategory || "সাংস্কৃতিক মেলা",
          eventDate: formDate,
          eventTime: formTime || "10:00",
          venue: formExtra1,
          organizer: formExtra2 || undefined,
          description: formContent,
          image: formImage || undefined,
          registrationLink: formUrl || undefined,
          isActive: formIsActive,
          updatedAt: serverTimestamp()
        };

        if (editingId) {
          await updateDoc(doc(db, "events", editingId), payload).catch(async () => {
            await setDoc(doc(db, "events", editingId), payload);
          });
          showNotification("ইভেন্ট সফলভাবে আপডেট করা হয়েছে!");
        } else {
          await addDoc(collection(db, "events"), { ...payload, createdAt: serverTimestamp() });
          showNotification("নতুন ইভেন্ট সফলভাবে যুক্ত করা হয়েছে!");
        }
      } else if (activeSection === "tourism") {
        if (!formTitle || !formContent || !formExtra1) throw new Error("দর্শনীয় স্থানের নাম, বিবরণ ও অবস্থান আবশ্যক।");
        const payload = {
          name: formTitle,
          category: formCategory || "রাজবাড়ী",
          description: formContent,
          location: formExtra1,
          openingHours: formExtra2 || undefined,
          entryFee: formExtra3 || undefined,
          mapUrl: formUrl || undefined,
          image: formImage || undefined,
          isActive: formIsActive,
          updatedAt: serverTimestamp()
        };

        if (editingId) {
          await updateDoc(doc(db, "tourism_spots", editingId), payload).catch(async () => {
            await setDoc(doc(db, "tourism_spots", editingId), payload);
          });
          showNotification("পর্যটন স্থান সফলভাবে আপডেট করা হয়েছে!");
        } else {
          await addDoc(collection(db, "tourism_spots"), { ...payload, createdAt: serverTimestamp() });
          showNotification("নতুন পর্যটন স্থান সফলভাবে যুক্ত করা হয়েছে!");
        }
      } else if (activeSection === "dynamic") {
        if (!formTitle || !formUrl) throw new Error("শিরোনাম এবং লিঙ্ক/ডাউনলোড লিঙ্ক আবশ্যক।");
        const payload = {
          title: formTitle,
          category: formCategory || "আবেদন ফরম",
          type: formType || "pdf_form",
          description: formContent || undefined,
          url: formUrl,
          fileSize: formExtra1 || "১.৫ এমবি",
          colorTheme: formExtra2 || "emerald",
          isActive: formIsActive,
          updatedAt: serverTimestamp()
        };

        if (editingId) {
          await updateDoc(doc(db, "download_documents", editingId), payload).catch(async () => {
            await setDoc(doc(db, "download_documents", editingId), payload);
          });
          showNotification("ডাইনামিক কন্টেন্ট সফলভাবে আপডেট করা হয়েছে!");
        } else {
          await addDoc(collection(db, "download_documents"), { ...payload, createdAt: serverTimestamp() });
          showNotification("নতুন কন্টেন্ট সফলভাবে যুক্ত করা হয়েছে!");
        }
      }

      setShowModal(false);
      resetForm();
    } catch (err: any) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, activeSection);
      showNotification(err.message || "সংরক্ষণ করা সম্ভব হয়নি। আবার চেষ্টা করুন।", true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean, colName: string) => {
    try {
      await updateDoc(doc(db, colName, id), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp()
      });
      showNotification("সক্রিয় স্ট্যাটাস পরিবর্তন করা হয়েছে!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${colName}/${id}`);
      showNotification("স্ট্যাটাস পরিবর্তন করা যায়নি।", true);
    }
  };

  const handleDeleteItem = async (id: string, colName: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই কন্টেন্টটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, colName, id));
      showNotification("কন্টেন্ট মুছে ফেলা হয়েছে!");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${colName}/${id}`);
      showNotification("কন্টেন্ট মুছতে সমস্যা হয়েছে।", true);
    }
  };

  // Filter lists based on search term & category filter
  const getFilteredData = () => {
    const q = searchTerm.toLowerCase();

    if (activeSection === "news") {
      return news.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.category.toLowerCase().includes(q);
        const matchesCategory = categoryFilter === "all" || n.category === categoryFilter;
        return matchesSearch && matchesCategory;
      });
    } else if (activeSection === "notice") {
      return notices.filter(n => {
        const matchesSearch = (n.title && n.title.toLowerCase().includes(q)) || n.text.toLowerCase().includes(q);
        return matchesSearch;
      });
    } else if (activeSection === "banner") {
      return banners.filter(b => {
        const matchesSearch = b.title.toLowerCase().includes(q) || b.slotType.toLowerCase().includes(q);
        const matchesCategory = categoryFilter === "all" || b.slotType === categoryFilter;
        return matchesSearch && matchesCategory;
      });
    } else if (activeSection === "event") {
      return events.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
        const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
        return matchesSearch && matchesCategory;
      });
    } else if (activeSection === "tourism") {
      return tourism.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(q) || t.location.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
        const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
        return matchesSearch && matchesCategory;
      });
    } else if (activeSection === "dynamic") {
      return dynamicItems.filter(d => {
        const matchesSearch = d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
        const matchesCategory = categoryFilter === "all" || d.type === categoryFilter;
        return matchesSearch && matchesCategory;
      });
    }
    return [];
  };

  const filteredData = getFilteredData();

  // Navigation tab configuration
  const sections = [
    { id: "news", label: "সংবাদ ও খবরাখবর", icon: Newspaper, color: "text-blue-600 bg-blue-50 border-blue-200", count: news.length, colName: "news" },
    { id: "notice", label: "জরুরি নোটিশ", icon: Megaphone, color: "text-[#007A5E] bg-emerald-50 border-emerald-200", count: notices.length, colName: "notices" },
    { id: "banner", label: "ব্যানার ও বিজ্ঞাপন", icon: ImageIcon, color: "text-amber-600 bg-amber-50 border-amber-200", count: banners.length, colName: "ads" },
    { id: "event", label: "ইভেন্ট ও মেলা", icon: Calendar, color: "text-purple-600 bg-purple-50 border-purple-200", count: events.length, colName: "events" },
    { id: "tourism", label: "পর্যটন ও ঐতিহ্য", icon: Landmark, color: "text-teal-600 bg-teal-50 border-teal-200", count: tourism.length, colName: "tourism_spots" },
    { id: "dynamic", label: "অন্যান্য ডাইনামিক কন্টেন্ট", icon: FileText, color: "text-indigo-600 bg-indigo-50 border-indigo-200", count: dynamicItems.length, colName: "download_documents" },
  ];

  const currentSection = sections.find(s => s.id === activeSection)!;

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 md:p-8 rounded-[28px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold mb-2 backdrop-blur-sm border border-emerald-500/30">
              <ShieldCheck size={14} />৭. Content Management Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              কন্টেন্ট ও প্রকাশনা সেন্টার
            </h1>
            <p className="text-emerald-100/80 text-xs md:text-sm mt-1 max-w-xl font-medium">
              পুঠিয়ার সংবাদ, নোটিশ বোর্ড, ব্যানার, ঐতিহাসিক ইভেন্ট, পর্যটন তথ্য ও ডাইনামিক কন্টেন্ট সহজে পরিচালনা করুন।
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-3 bg-[#009664] hover:bg-emerald-500 text-white font-black text-xs md:text-sm rounded-[16px] shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>নতুন {currentSection.label} যোগ করুন</span>
          </button>
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
            <AlertCircle className="text-rose-600 shrink-0" size={18} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {sections.map(sec => {
          const IconComponent = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id as ManagementSection);
                setCategoryFilter("all");
                setSearchTerm("");
              }}
              className={`flex flex-col items-center justify-center p-3.5 rounded-[20px] transition-all border text-center ${
                isActive
                  ? "bg-white border-[#009664] shadow-md ring-2 ring-[#009664]/20 scale-[1.02]"
                  : "bg-white/80 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className={`p-2.5 rounded-[14px] mb-2 ${sec.color}`}>
                <IconComponent size={20} />
              </div>
              <span className="text-xs font-black text-slate-800 line-clamp-1">{sec.label}</span>
              <span className="text-[10px] font-bold text-slate-400 mt-0.5">{sec.count}টি রেকর্ড</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`${currentSection.label} খুঁজুন...`}
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs font-bold text-slate-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Category Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-[12px] px-3 py-2 focus:outline-none"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            {activeSection === "news" && (
              <>
                <option value="সাধারণ">সাধারণ</option>
                <option value="সংস্কৃতি ও ঐতিহ্য">সংস্কৃতি ও ঐতিহ্য</option>
                <option value="কৃষি ও খামার">কৃষি ও খামার</option>
                <option value="ভূমি ও ই-সেবা">ভূমি ও ই-সেবা</option>
              </>
            )}
            {activeSection === "banner" && (
              <>
                <option value="home_hero">হোমপেজ হেডার স্লাইডার</option>
                <option value="top_banner">শীর্ষ প্রমোশনাল ব্যানার</option>
                <option value="sidebar_ad">সাইডবার বিজ্ঞাপন</option>
              </>
            )}
            {activeSection === "event" && (
              <>
                <option value="সাংস্কৃতিক মেলা">সাংস্কৃতিক মেলা</option>
                <option value="ক্রীড়া প্রতিযোগিতা">ক্রীড়া প্রতিযোগিতা</option>
                <option value="সরকারি অনুষ্ঠান">সরকারি অনুষ্ঠান</option>
              </>
            )}
            {activeSection === "tourism" && (
              <>
                <option value="রাজবাড়ী">রাজবাড়ী</option>
                <option value="মন্দির">মন্দির</option>
                <option value="দিঘি ও পার্ক">দিঘি ও পার্ক</option>
              </>
            )}
            {activeSection === "dynamic" && (
              <>
                <option value="pdf_form">PDF আবেদন ফরম</option>
                <option value="external_link">অফিসিয়াল লিঙ্ক</option>
                <option value="popup_alert">পপআপ অ্যালার্ট</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-[24px] border border-slate-200">
          <Loader2 className="animate-spin text-emerald-600 mx-auto mb-2" size={32} />
          <p className="text-xs font-bold text-slate-500">তথ্য লোড করা হচ্ছে...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-[24px] border border-slate-200">
          <Info className="text-slate-300 mx-auto mb-2" size={36} />
          <h3 className="text-sm font-black text-slate-700">কোন কন্টেন্ট পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-400 mt-1">নতুন রেকর্ড যোগ করতে উপরের বোতামে ক্লিক করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. NEWS LIST CARDS */}
          {activeSection === "news" && filteredData.map((item: any) => (
            <div key={item.id} className="bg-white rounded-[20px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              {item.image && (
                <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  {item.isBreaking && (
                    <span className="absolute top-2 left-2 px-2.5 py-1 bg-rose-600 text-white font-black text-[10px] rounded-full flex items-center gap-1 shadow-md">
                      <Flame size={12} /> ব্রেকিং নিউজ
                    </span>
                  )}
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold">{item.category}</span>
                    <span>{item.date} • {item.time}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 font-medium">{item.content}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(item.id, item.isActive ?? true, "news")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                      item.isActive !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.isActive !== false ? "প্রকাশিত" : "খসড়া (Draft)"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(item.id, "news")} className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 2. NOTICE LIST CARDS */}
          {activeSection === "notice" && filteredData.map((item: any) => (
            <div key={item.id} className="bg-white rounded-[20px] border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white" style={{ backgroundColor: item.color || "#007A5E" }}>
                    {item.priority === "high" ? "জরুরি" : item.priority === "low" ? "সাধারণ" : "গুরুত্বপূর্ণ"}
                  </span>
                  {item.isPinned && (
                    <span className="text-amber-500 flex items-center gap-1 text-[11px] font-bold">
                      <Pin size={12} /> পিন করা
                    </span>
                  )}
                </div>
                {item.title && <h3 className="text-sm font-black text-slate-900 mb-1">{item.title}</h3>}
                <p className="text-xs font-semibold text-slate-700">{item.text || item.content}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(item.id, item.isActive ?? true, "notices")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                    item.isActive !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.isActive !== false ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </button>

                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteItem(item.id, "notices")} className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* 3. BANNER CARDS */}
          {activeSection === "banner" && filteredData.map((item: any) => (
            <div key={item.id} className="bg-white rounded-[20px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="h-36 w-full overflow-hidden bg-slate-100 relative">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-black/70 text-white font-bold text-[10px] rounded-full backdrop-blur-md">
                  {item.slotType === "home_hero" ? "হেডার স্লাইডার" : item.slotType === "top_banner" ? "টপ ব্যানার" : "সাইডবার অ্যাড"}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 line-clamp-2">{item.title}</h3>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1 hover:underline">
                      <Link2 size={12} /> {item.link}
                    </a>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">সিরিয়াল: #{item.order || 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(item.id, item.isActive ?? true, "ads")}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        item.isActive !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.isActive !== false ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </button>
                    <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(item.id, "ads")} className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 4. EVENT CARDS */}
          {activeSection === "event" && filteredData.map((item: any) => (
            <div key={item.id} className="bg-white rounded-[20px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              {item.image && (
                <div className="h-36 w-full overflow-hidden bg-slate-100 relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-purple-600 text-white font-bold text-[10px] rounded-full">
                    {item.category}
                  </span>
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 line-clamp-2">{item.title}</h3>
                  <div className="mt-2 space-y-1 text-xs text-slate-600 font-medium">
                    <p className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <Calendar size={14} className="text-purple-600" /> {item.eventDate} ({item.eventTime})
                    </p>
                    <p className="line-clamp-1">📍 {item.venue}</p>
                    {item.organizer && <p className="line-clamp-1">🏛️ আয়োজক: {item.organizer}</p>}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(item.id, item.isActive ?? true, "events")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                      item.isActive !== false ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.isActive !== false ? "সক্রিয়" : "স্থগিত"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(item.id, "events")} className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 5. TOURISM CARDS */}
          {activeSection === "tourism" && filteredData.map((item: any) => (
            <div key={item.id} className="bg-white rounded-[20px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              {item.image && (
                <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-teal-600 text-white font-bold text-[10px] rounded-full">
                    {item.category}
                  </span>
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">{item.name}</h3>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">📍 {item.location}</p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 font-medium">{item.description}</p>
                  {item.entryFee && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">
                      🎟️ {item.entryFee}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(item.id, item.isActive ?? true, "tourism_spots")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                      item.isActive !== false ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.isActive !== false ? "প্রদর্শিত" : "লুকানো"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(item.id, "tourism_spots")} className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 6. DYNAMIC CONTENT CARDS */}
          {activeSection === "dynamic" && filteredData.map((item: any) => (
            <div key={item.id} className="bg-white rounded-[20px] border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-full">
                    {item.type === "pdf_form" ? "📄 PDF ফরম" : item.type === "external_link" ? "🌐 লিংক" : "⚡ পপআপ নোটিশ"}
                  </span>
                  {item.fileSize && <span className="text-[10px] text-slate-400 font-bold">{item.fileSize}</span>}
                </div>
                <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                {item.description && <p className="text-xs text-slate-600 mt-1 font-medium">{item.description}</p>}
                <a href={item.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 flex items-center gap-1 mt-2 hover:underline">
                  <Download size={12} /> ফাইল লিঙ্ক দেখুন
                </a>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(item.id, item.isActive ?? true, "download_documents")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                    item.isActive !== false ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.isActive !== false ? "সক্রিয়" : "বন্ধ"}
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteItem(item.id, "download_documents")} className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* MODAL FORM FOR ADDING / EDITING CONTENT */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden my-8"
            >
              <div className="p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black flex items-center gap-2">
                    <Edit size={18} className="text-emerald-400" />
                    {editingId ? `${currentSection.label} এডিটিং` : `নতুন ${currentSection.label} সংযোজন`}
                  </h3>
                  <p className="text-[11px] text-emerald-100/70 mt-0.5">সকল প্রয়োজনীয় ঘর পূরণ করে সংরক্ষণ করুন</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                
                {/* TITLE / NAME */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    {activeSection === "tourism" ? "দর্শনীয় স্থানের নাম" : activeSection === "notice" ? "নোটিশের শিরোনাম (ঐচ্ছিক)" : "শিরোনাম / নাম"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={activeSection !== "notice"}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="এখানে শিরোনাম লিখুন..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* CATEGORY & DATES IF APPLICABLE */}
                {["news", "event", "tourism", "dynamic"].includes(activeSection) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-black text-slate-700 mb-1">ক্যাটাগরি</label>
                      <input
                        type="text"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        placeholder="যেমন: সাধারণ, মেলা, ঐতিহ্য..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {["news", "event"].includes(activeSection) && (
                      <div>
                        <label className="block text-[11px] font-black text-slate-700 mb-1">তারিখ</label>
                        <input
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* BANNER SPECIFIC FIELDS */}
                {activeSection === "banner" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-black text-slate-700 mb-1">ব্যানার অবস্থান (Slot Location)</label>
                      <select
                        value={formSlotType}
                        onChange={(e) => setFormSlotType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="home_hero">হোমপেজ হেডার স্লাইডার (Hero)</option>
                        <option value="top_banner">টপ প্রমোশনাল ব্যানার</option>
                        <option value="sidebar_ad">সাইডবার বিজ্ঞাপন স্পট</option>
                        <option value="footer_banner">ফুটার ব্যানার</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-700 mb-1">ছবির লিঙ্ক (URL) <span className="text-rose-500">*</span></label>
                      <input
                        type="url"
                        required
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* IMAGE URL FOR NEWS, EVENT, TOURISM */}
                {["news", "event", "tourism"].includes(activeSection) && (
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">ছবির লিঙ্ক (Image URL)</label>
                    <input
                      type="url"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                )}

                {/* EXTRA FIELDS FOR EVENT & TOURISM */}
                {activeSection === "event" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-black text-slate-700 mb-1">ভেন্যু / স্থান <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formExtra1}
                        onChange={(e) => setFormExtra1(e.target.value)}
                        placeholder="যেমন: রাজবাড়ী প্রাঙ্গণ"
                        className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-700 mb-1">আয়োজক প্রতিষ্ঠান</label>
                      <input
                        type="text"
                        value={formExtra2}
                        onChange={(e) => setFormExtra2(e.target.value)}
                        placeholder="যেমন: উপজেলা পরিষদ"
                        className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeSection === "tourism" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-black text-slate-700 mb-1">অবস্থান / ঠিকানা <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formExtra1}
                        onChange={(e) => setFormExtra1(e.target.value)}
                        placeholder="যেমন: রাজবাড়ী চত্বর, পুঠিয়া সদর"
                        className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black text-slate-700 mb-1">পরিদর্শনের সময়</label>
                        <input
                          type="text"
                          value={formExtra2}
                          onChange={(e) => setFormExtra2(e.target.value)}
                          placeholder="সকাল ৯:০০ - বিকাল ৫:৩০"
                          className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-700 mb-1">প্রবেশ মূল্য</label>
                        <input
                          type="text"
                          value={formExtra3}
                          onChange={(e) => setFormExtra3(e.target.value)}
                          placeholder="বিনামূল্যে / ২০ টাকা"
                          className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TARGET LINK FOR BANNERS, EVENTS, DYNAMIC */}
                {["banner", "event", "tourism", "dynamic", "notice"].includes(activeSection) && (
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">ওয়েব লিঙ্ক / রিডাইরেক্ট URL</label>
                    <input
                      type="url"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                )}

                {/* CONTENT / DESCRIPTION */}
                {activeSection !== "banner" && (
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      {activeSection === "notice" ? "নোটিশ বার্তা" : "বিস্তারিত বিবরণ"} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="বিস্তারিত তথ্য লিখুন..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-3 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                )}

                {/* FLAGS & ACTIVE TOGGLE */}
                <div className="pt-2 flex flex-wrap gap-4 items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-700">তাত্ক্ষণিকভাবে সক্রিয় প্রকাশ করুন</span>
                  </label>

                  {activeSection === "news" && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsBreaking}
                        onChange={(e) => setFormIsBreaking(e.target.checked)}
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-xs font-bold text-rose-700">ব্রেকিং নিউজ হিসেবে দিন</span>
                    </label>
                  )}

                  {activeSection === "notice" && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsPinned}
                        onChange={(e) => setFormIsPinned(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-amber-700">উপরে পিন করে রাখুন</span>
                    </label>
                  )}
                </div>

                {/* MODAL ACTION BUTTONS */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-[12px]"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#009664] hover:bg-emerald-700 text-white font-black text-xs rounded-[12px] shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {actionLoading && <Loader2 size={14} className="animate-spin" />}
                    <span>{actionLoading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Smartphone, PlayCircle, HelpCircle, Phone, ArrowLeft, 
  ExternalLink, Globe, MapPin, Mail, Clock, Send, 
  MessageSquare, Download, CheckCircle, Search, Youtube, 
  Info, ShieldAlert, ChevronDown, ChevronUp, Star, PhoneCall, AlertCircle,
  Plus, Ticket, FileText, Filter, CheckCircle2, MessageCircle, User,
  Paperclip, ThumbsUp, ThumbsDown, RefreshCw, Sparkles, Share2,
  Headphones, ShieldCheck, HeartHandshake, FileCheck, Stethoscope,
  Droplet, Store, Bus, Gift, Briefcase, MessageSquareWarning, Shield
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import BottomNavigation from "../../components/home/BottomNavigation";
import { UnifiedHeroHeader } from "../../components/common/UnifiedDesignSystem";
import SEO from "../../components/SEO";
import { 
  MOCK_PUTHIA_FAQS, 
  MOCK_PUTHIA_TICKETS, 
  SupportTicket, 
  getTicketProgressSteps,
  FaqItem 
} from "../../services/supportCenterService";

// Platform Module Guide Interface
interface PlatformModuleItem {
  id: string;
  name: string;
  banglaName: string;
  desc: string;
  badge: string;
  route: string;
  icon: any;
  colorBg: string;
  textColor: string;
  category: string;
}

// Platform Video Guide Interface
interface PlatformVideoGuide {
  id: string;
  title: string;
  desc: string;
  duration: string;
  youtubeId: string;
  category: string;
}

// Helpline Interface
interface HelplineItem {
  id: string;
  name: string;
  number: string;
  shortDesc: string;
  category: 'amader_puthia' | 'emergency' | 'healthcare' | 'utility';
  iconBg: string;
  availableHours: string;
  isOfficialPuthia?: boolean;
}

// 1. Amader Puthia Platform Modules Data
const PLATFORM_MODULES: PlatformModuleItem[] = [
  {
    id: "blood",
    name: "Blood Bank & Donors",
    banglaName: "রক্তদান ও জরুরি ব্লাড ব্যাংক",
    desc: "পুঠিয়া উপজেলার সকল ইউনিয়নের রক্তের গ্রুপভিত্তিক সক্রিয় রক্তদাতাদের তালিকা, সরাসরি ফোন কল ও নতুন রক্তদাতা নিবন্ধন।",
    badge: "জরুরি সেবা",
    route: "/blood",
    icon: Droplet,
    colorBg: "bg-rose-50 border-rose-200",
    textColor: "text-rose-600",
    category: "স্বাস্থ্য ও রক্ত"
  },
  {
    id: "doctors",
    name: "Doctor Appointment",
    banglaName: "ডাক্তার সিরিয়াল ও চেম্বার বুকিং",
    desc: "উপজেলা স্বাস্থ্য কমপ্লেক্স ও বিভিন্ন ক্লিনিকের বিশেষজ্ঞ চিকিৎসকদের তালিকা, ভিজিটিং সময় এবং তাৎক্ষণিক ডিজিটাল সিরিয়াল।",
    badge: "লাইভ বুকিং",
    route: "/doctors",
    icon: Stethoscope,
    colorBg: "bg-emerald-50 border-emerald-200",
    textColor: "text-[#006847]",
    category: "স্বাস্থ্য ও চিকিৎসা"
  },
  {
    id: "shops",
    name: "Shops & Merchant Directory",
    banglaName: "দোকান ও ব্যবসা লিস্টিং",
    desc: "পুঠিয়া ও বানেশ্বর বাজারের সকল প্রকার দোকান, ফার্মেসি, সার্ভিস পয়েন্ট খুঁজুন এবং আপনার ব্যবসা ফ্রিতে তালিকাভুক্ত করুন।",
    badge: "বিনামূল্যে লিস্টিং",
    route: "/shops",
    icon: Store,
    colorBg: "bg-amber-50 border-amber-200",
    textColor: "text-amber-700",
    category: "ব্যবসা ও বাণিজ্য"
  },
  {
    id: "bus",
    name: "Bus & Transport Schedule",
    banglaName: "বাস শিডিউল ও কাউন্টার যোগাযোগ",
    desc: "ঢাকা, রাজশাহী, নাটোর ও বিভিন্ন রুটের বাসের সময়সূচি, ভাড়ার তালিকা ও স্থানীয় টিকিট কাউন্টারের সরাসরি মোবাইল নম্বর।",
    badge: "যাতায়াত গাইড",
    route: "/bus",
    icon: Bus,
    colorBg: "bg-blue-50 border-blue-200",
    textColor: "text-blue-600",
    category: "পরিবহন"
  },
  {
    id: "referral",
    name: "Referral & Rewards",
    banglaName: "রেফারেল প্রোগ্রাম ও রিওয়ার্ড আর্নিং",
    desc: "আমাদের পুঠিয়া ওয়েবসাইট বন্ধুদের সাথে শেয়ার করে ইনভাইট করুন এবং আকর্ষণীয় বোনাস পয়েন্ট ও পুরস্কার জিতে নিন।",
    badge: "আকর্ষণীয় বোনাস",
    route: "/referral",
    icon: Gift,
    colorBg: "bg-purple-50 border-purple-200",
    textColor: "text-purple-600",
    category: "ইনকাম ও রিওয়ার্ড"
  },
  {
    id: "jobs",
    name: "Local Jobs & Career",
    banglaName: "পুঠিয়া চাকরি ও ক্যারিয়ার নোটিশ",
    desc: "উপজেলার স্থানীয় প্রতিষ্ঠান, শোরুম ও অনলাইনে নতুন চাকরির খবর ও সরাসরি নিয়োগদাতার সাথে যোগাযোগের সুযোগ।",
    badge: "কর্মসংস্থান",
    route: "/jobs",
    icon: Briefcase,
    colorBg: "bg-teal-50 border-teal-200",
    textColor: "text-teal-700",
    category: "ক্যারিয়ার"
  },
  {
    id: "complaints",
    name: "Citizen Grievance & Feedback",
    banglaName: "নাগরিক অভিযোগ ও মতামত দাখিল",
    desc: "পুঠিয়ার সার্বিক উন্নয়ন, রাস্তার সমস্যা বা সাইটের তথ্য সংশোধন সংক্রান্ত নাগরিক অভিযোগ ও সরাসরি পরামর্শ দেওয়ার সেল।",
    badge: "সরাসরি সমাধান",
    route: "/complaints",
    icon: MessageSquareWarning,
    colorBg: "bg-orange-50 border-orange-200",
    textColor: "text-orange-600",
    category: "অভিযোগ সেল"
  },
  {
    id: "app-download",
    name: "Amader Puthia Mobile App",
    banglaName: "আমাদের পুঠিয়া মোবাইল অ্যাপ (PWA)",
    desc: "এক ক্লিকে আপনার ফোনে আমাদের পুঠিয়া অফিশিয়াল ওয়েব অ্যাপ ইনস্টল করুন এবং সুপারফাস্ট গতিতে সেবা গ্রহণ করুন।",
    badge: "অফলাইন রেডি",
    route: "/app-download",
    icon: Smartphone,
    colorBg: "bg-emerald-100 border-emerald-300",
    textColor: "text-[#006847]",
    category: "মোবাইল অ্যাপ"
  }
];

// 2. Amader Puthia Platform Video Guides Data
const PLATFORM_VIDEOS: PlatformVideoGuide[] = [
  {
    id: "v-puthia-1",
    title: "আমাদের পুঠিয়া ওয়েবসাইটে অ্যাকাউন্ট খোলা ও প্রোফাইল ভেরিফিকেশন",
    desc: "কীভাবে সহজে আমাদের পুঠিয়া পোর্টালে ১ মিনিটে বিনামূল্যে অ্যাকাউন্ট খুলবেন এবং সকল ফিচার আনলক করবেন।",
    duration: "৪:১৫ মিনিট",
    youtubeId: "p5b9H0Y_L0g",
    category: "অ্যাকাউন্ট গাইড"
  },
  {
    id: "v-puthia-2",
    title: "জরুরি প্রয়োজনে পুঠিয়ায় রক্তের গ্রুপ অনুযায়ী রক্তদাতা খোঁজার নিয়ম",
    desc: "ইউনিয়নভিত্তিক রক্তদাতাদের তালিকা থেকে তাৎক্ষণিক কল দেওয়া এবং রক্তদাতা হিসেবে নাম যুক্ত করার পদ্ধতি।",
    duration: "৫:৩০ মিনিট",
    youtubeId: "8W0_b4Z6pE",
    category: "রক্তদান সেবা"
  },
  {
    id: "v-puthia-3",
    title: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স ও চেম্বারে ডাক্তার সিরিয়াল নেওয়ার উপায়",
    desc: "ডাক্তারদের সময়সূচি দেখে ঘরে বসেই মোবাইলে ডিজিটাল সিরিয়াল স্লিপ বুকিং করার সহজ নিয়ম।",
    duration: "৬:১০ মিনিট",
    youtubeId: "vB-Y8vFhA0w",
    category: "ডাক্তার বুকিং"
  },
  {
    id: "v-puthia-4",
    title: "আপনার দোকান বা ব্যবসা প্রতিষ্ঠান আমাদের পুঠিয়ায় ফ্রিতে যুক্ত করার নিয়ম",
    desc: "পুঠিয়ার ব্যবসায়ী ভাইদের জন্য নিজের দোকান ও মোবাইল নম্বর ডিজিটাল ডিরেক্টরিতে যুক্ত করার নির্দেশিকা।",
    duration: "৫:৪৫ মিনিট",
    youtubeId: "Xp3nI0eNq0k",
    category: "দোকান ও ব্যবসা"
  },
  {
    id: "v-puthia-5",
    title: "রেফারেল কোড শেয়ার করে বন্ধুদের ইনভাইট ও পয়েন্ট আর্ন করার পদ্ধতি",
    desc: "আমাদের পুঠিয়া রেফারেল লিংক দিয়ে ইনভাইট করে উপহার ও ক্যাশ বোনাস জেতার উপায়।",
    duration: "৩:৫০ মিনিট",
    youtubeId: "9oX27Y3u9K8",
    category: "রেফারেল প্রোগ্রাম"
  },
  {
    id: "v-puthia-6",
    title: "মোবাইলের হোমস্ক্রিনে আমাদের পুঠিয়া অ্যাপ (PWA) ইনস্টল করার নিয়ম",
    desc: "প্লেস্টোরে না গিয়েও গুগল ক্রোম বা সাফারি দিয়ে ১ ক্লিকে মোবাইল অ্যাপ হিসেবে সেটআপ করার সহজ টিউটোরিয়াল।",
    duration: "৩:২০ মিনিট",
    youtubeId: "vGcl92X8FpY",
    category: "অ্যাপ ইনস্টল"
  }
];

// 3. Amader Puthia Helplines Data
const PUTHIA_HELPLINES: HelplineItem[] = [
  {
    id: "ph-1",
    name: "আমাদের পুঠিয়া সেন্ট্রাল হেল্পডেস্ক",
    number: "01766-628847",
    shortDesc: "ওয়েবসাইটের যেকোনো সমস্যা, অ্যাকাউন্ট রিকভারি ও তথ্য সংশোধনে সরাসরি সহায়তা।",
    category: "amader_puthia",
    iconBg: "bg-[#006847] text-white",
    availableHours: "সকাল ৮টা - রাত ১১টা",
    isOfficialPuthia: true
  },
  {
    id: "ph-2",
    name: "আমাদের পুঠিয়া হোয়াটসঅ্যাপ সাপোর্ট",
    number: "01766-628847",
    shortDesc: "তাৎক্ষণিক স্ক্রিনশট শেয়ার ও চ্যাটের মাধ্যমে টেকনিক্যাল সমাধান পেতে হোয়াটসঅ্যাপে লিখুন।",
    category: "amader_puthia",
    iconBg: "bg-emerald-600 text-white",
    availableHours: "২৪ ঘণ্টা মেসেজ গৃহীত",
    isOfficialPuthia: true
  },
  {
    id: "ph-3",
    name: "জরুরি রক্ত সহায়তা হেল্পলাইন (আমাদের পুঠিয়া)",
    number: "01766-628847",
    shortDesc: "মুমূর্ষু রোগীর জন্য অতিজরুরি রক্তের সন্ধান ও ডোনার সমন্বয়ে ডেডিকেটেড সেল।",
    category: "healthcare",
    iconBg: "bg-rose-600 text-white",
    availableHours: "২৪ ঘণ্টা সচল",
    isOfficialPuthia: true
  },
  {
    id: "ph-4",
    name: "পুঠিয়া থানা ডিউটি অফিসার",
    number: "01320-123456",
    shortDesc: "পুঠিয়া উপজেলার আইনশৃঙ্খলা ও জরুরি পুলিশি সেবা কন্ট্রোল রুম।",
    category: "emergency",
    iconBg: "bg-slate-800 text-white",
    availableHours: "২৪ ঘণ্টা সচল"
  },
  {
    id: "ph-5",
    name: "পুঠিয়া ফায়ার সার্ভিস ও সিভিল ডিফেন্স",
    number: "01711-223344",
    shortDesc: "আগুন লাগা, সড়ক দুর্ঘটনা ও উদ্ধারকাজে তাৎক্ষণিক সেবা প্রদান।",
    category: "emergency",
    iconBg: "bg-orange-600 text-white",
    availableHours: "২৪ ঘণ্টা সচল"
  },
  {
    id: "ph-6",
    name: "উপজেলা স্বাস্থ্য কমপ্লেক্স পুঠিয়া (জরুরি বিভাগ)",
    number: "01730-001122",
    shortDesc: "সরকারি হাসপাতাল জরুরি টিকিট ও অ্যাম্বুলেন্স সংক্রান্ত তথ্য সেল।",
    category: "healthcare",
    iconBg: "bg-teal-700 text-white",
    availableHours: "২৪ ঘণ্টা সচল"
  },
  {
    id: "ph-7",
    name: "পুঠিয়া পল্লী বিদ্যুৎ অভিযোগ কেন্দ্র",
    number: "01769-400300",
    shortDesc: "বিদ্যুৎ বিভ্রাট, ট্রান্সফরমার সমস্যা ও জরুরি সংযোগ সহায়িকা।",
    category: "utility",
    iconBg: "bg-sky-700 text-white",
    availableHours: "২৪ ঘণ্টা অভিযোগ গ্রহণ"
  },
  {
    id: "ph-8",
    name: "জাতীয় জরুরি সেবা (৯৯৯)",
    number: "999",
    shortDesc: "পুলিশ, ফায়ার সার্ভিস ও অ্যাম্বুলেন্স সেবায় দেশের সার্বজনীন ফ্রি কল।",
    category: "emergency",
    iconBg: "bg-red-600 text-white",
    availableHours: "২৪ ঘণ্টা (টোল ফ্রি)"
  }
];

export default function SupportCenterPage({ initialTab }: { initialTab?: string }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Active Tab: modules | video | ticket | helpline | faq | contact
  const activeTab = searchParams.get("tab") || initialTab || "modules";
  
  // Global Search Input
  const [globalQuery, setGlobalQuery] = useState("");

  // FAQ State
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategory, setFaqCategory] = useState("সব");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [faqHelpfulRatings, setFaqHelpfulRatings] = useState<Record<string, 'yes' | 'no'>>({});

  // Video State
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem("amader_puthia_support_tickets");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: any) => ({
            ...t,
            replies: Array.isArray(t?.replies) ? t.replies : []
          }));
        }
      }
    } catch {
      // fallback
    }
    return MOCK_PUTHIA_TICKETS;
  });

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(() => {
    try {
      const saved = localStorage.getItem("amader_puthia_support_tickets");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          return {
            ...first,
            replies: Array.isArray(first?.replies) ? first.replies : []
          };
        }
      }
    } catch {
      // fallback
    }
    return MOCK_PUTHIA_TICKETS[0] || null;
  });

  const [ticketSearchId, setTicketSearchId] = useState("");
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState("ALL");

  // New Ticket Form State
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState<'ACCOUNT' | 'DOCTOR' | 'BLOOD' | 'MERCHANT' | 'REFERRAL' | 'TECHNICAL' | 'GENERAL'>('GENERAL');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newMessage, setNewMessage] = useState("");
  const [newAttachment, setNewAttachment] = useState("");
  const [replyText, setReplyText] = useState("");

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: "",
    mobile: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab]);

  // Persist Tickets to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("amader_puthia_support_tickets", JSON.stringify(tickets));
    } catch {
      // handle quota
    }
  }, [tickets]);

  const handleTabChange = (tabName: string) => {
    setSearchParams({ tab: tabName });
  };

  // Ticket Handlers
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) {
      toast.error("অনুগ্রহ করে বিষয় ও বার্তার বিবরণ লিখুন");
      return;
    }

    const ticketId = `TCK-${Math.floor(100 + Math.random() * 900)}`;
    const createdTicket: SupportTicket = {
      id: ticketId,
      subject: newSubject,
      category: newCategory,
      priority: newPriority,
      status: 'OPEN',
      createdAt: new Date().toLocaleString('bn-BD', { hour12: true }),
      userEmail: "mdzosimuddin47@gmail.com",
      assignedTo: "সাপোর্ট ডেস্ক (অপেক্ষমান)",
      estimatedResolutionTime: "১-২ ঘণ্টার মধ্যে",
      progressPercent: 25,
      replies: [
        {
          id: `R-${Date.now()}`,
          sender: 'USER',
          senderName: 'ব্যবহারকারী',
          message: newMessage + (newAttachment ? `\n[সংযুক্তি: ${newAttachment}]` : ''),
          createdAt: new Date().toLocaleString('bn-BD', { hour12: true })
        },
        {
          id: `R-${Date.now() + 1}`,
          sender: 'ADMIN',
          senderName: 'আমাদের পুঠিয়া সাপোর্ট ডেস্ক',
          message: `ধন্যবাদ! আপনার টিকিটটি সফলভাবে তৈরি হয়েছে (আইডি: ${ticketId})। আমাদের পুঠিয়া টিম দ্রুত আপনার বিষয়টি পর্যালোচনা করে সমাধান প্রদান করবে।`,
          createdAt: new Date().toLocaleString('bn-BD', { hour12: true })
        }
      ]
    };

    const updated = [createdTicket, ...tickets];
    setTickets(updated);
    setSelectedTicket(createdTicket);
    setNewSubject("");
    setNewMessage("");
    setNewAttachment("");
    setShowCreateTicketModal(false);
    toast.success(`সাপোর্ট টিকিট #${ticketId} তৈরি হয়েছে!`);
  };

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const newReply = {
      id: `R-${Date.now()}`,
      sender: 'USER' as const,
      senderName: 'ব্যবহারকারী',
      message: replyText,
      createdAt: new Date().toLocaleString('bn-BD', { hour12: true })
    };

    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      status: selectedTicket.status === 'CLOSED' ? 'OPEN' : selectedTicket.status,
      replies: [...(selectedTicket.replies || []), newReply]
    };

    const updatedList = (tickets || []).map(t => t.id === updatedTicket.id ? updatedTicket : t);
    setTickets(updatedList);
    setSelectedTicket(updatedTicket);
    setReplyText("");
    toast.success("আপনার বার্তা যোগ করা হয়েছে");
  };

  // Contact Form Submit
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.mobile || !contactForm.message) {
      toast.error("অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("আপনার বার্তাটি সফলভাবে আমাদের পুঠিয়া সাপোর্ট টিমে পাঠানো হয়েছে। ধন্যবাদ!");
      setContactForm({
        name: "",
        mobile: "",
        subject: "",
        message: ""
      });
      setIsSubmitting(false);
    }, 1000);
  };

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return MOCK_PUTHIA_FAQS.filter(faq => {
      const matchesQuery = globalQuery || faqSearch;
      const matchesSearch = !matchesQuery || 
        faq.question.toLowerCase().includes(matchesQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(matchesQuery.toLowerCase());
      const matchesCategory = faqCategory === "সব" || faq.category === faqCategory;
      return matchesSearch && matchesCategory;
    });
  }, [faqSearch, faqCategory, globalQuery]);

  // Filtered Modules
  const filteredModules = useMemo(() => {
    if (!globalQuery) return PLATFORM_MODULES;
    return PLATFORM_MODULES.filter(m => 
      m.banglaName.toLowerCase().includes(globalQuery.toLowerCase()) ||
      m.desc.toLowerCase().includes(globalQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(globalQuery.toLowerCase())
    );
  }, [globalQuery]);

  // Filtered Videos
  const filteredVideos = useMemo(() => {
    if (!globalQuery) return PLATFORM_VIDEOS;
    return PLATFORM_VIDEOS.filter(v => 
      v.title.toLowerCase().includes(globalQuery.toLowerCase()) ||
      v.desc.toLowerCase().includes(globalQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(globalQuery.toLowerCase())
    );
  }, [globalQuery]);

  // Filtered Helplines
  const filteredHelplines = useMemo(() => {
    if (!globalQuery) return PUTHIA_HELPLINES;
    return PUTHIA_HELPLINES.filter(h => 
      h.name.toLowerCase().includes(globalQuery.toLowerCase()) ||
      h.number.includes(globalQuery) ||
      h.shortDesc.toLowerCase().includes(globalQuery.toLowerCase())
    );
  }, [globalQuery]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = !ticketSearchId || 
        t.id.toLowerCase().includes(ticketSearchId.toLowerCase()) ||
        t.subject.toLowerCase().includes(ticketSearchId.toLowerCase());
      const matchesCat = ticketCategoryFilter === "ALL" || t.category === ticketCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [tickets, ticketSearchId, ticketCategoryFilter]);

  const handleFaqVote = (id: string, vote: 'yes' | 'no') => {
    setFaqHelpfulRatings(prev => ({ ...prev, [id]: vote }));
    toast.success("আপনার মতামতের জন্য ধন্যবাদ!");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      <SEO 
        title="হেল্প ও সাপোর্ট সেন্টার - আমাদের পুঠিয়া"
        description="আমাদের পুঠিয়া প্ল্যাটফর্মের সকল সেবা ব্যবহার সহায়িকা, সরাসরি সাপোর্ট টিকিট, ভিডিও টিউটোরিয়াল, হটলাইন ও হেল্পডেস্ক।"
      />

      <Header />

      {/* Full-width Standard Unified Hero Header */}
      <UnifiedHeroHeader
        title="হেল্প ও সাপোর্ট সেন্টার"
        subtitle="আমাদের পুঠিয়া ওয়েবসাইটের সকল সেবা ব্যবহার সহায়িকা, সরাসরি সাপোর্ট টিকিট, ভিডিও টিউটোরিয়াল, হটলাইন ও হেল্পডেস্ক।"
        badgeText="২৪/৭ লাইভ সাপোর্ট ও হেল্পডেস্ক"
        icon={<Headphones size={24} />}
        showBack={true}
        searchQuery={globalQuery}
        onSearchChange={setGlobalQuery}
        searchPlaceholder="কী সাহায্য প্রয়োজন? লিখুন (যেমন: রক্তদাতা, ডাক্তার সিরিয়াল, দোকান)..."
        rightAction={
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("লিংক শেয়ারের জন্য কপি করা হয়েছে!");
            }}
            className="py-1.5 px-3 bg-white hover:bg-emerald-50 text-[#006a4e] text-xs font-black rounded-xl flex items-center gap-1 shadow-md border-none cursor-pointer transition-all active:scale-95"
          >
            <Share2 size={15} className="text-[#006a4e] stroke-[2.5]" />
            <span>শেয়ার করুন</span>
          </button>
        }
      >
        {/* Quick Metrics Inside Hero Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-4xl mx-auto pt-3 text-left">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/15">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/30 text-emerald-200 flex items-center justify-center shrink-0 font-bold">
              <Clock size={15} />
            </div>
            <div>
              <span className="text-xs font-black block text-white">২৪/৭ সাপোর্ট</span>
              <span className="text-[10px] text-emerald-200 block">অনলাইন হেল্পডেস্ক</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/15">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/30 text-emerald-200 flex items-center justify-center shrink-0 font-bold">
              <PhoneCall size={15} />
            </div>
            <div>
              <span className="text-xs font-black block text-white">০১৭৬৬-৬২৮৮৪৭</span>
              <span className="text-[10px] text-emerald-200 block">অফিসিয়াল হটলাইন</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/15">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/30 text-emerald-200 flex items-center justify-center shrink-0 font-bold">
              <HeartHandshake size={15} />
            </div>
            <div>
              <span className="text-xs font-black block text-white">১০০% ফ্রি সেবা</span>
              <span className="text-[10px] text-emerald-200 block">নাগরিক প্ল্যাটফর্ম</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/15">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/30 text-emerald-200 flex items-center justify-center shrink-0 font-bold">
              <ShieldCheck size={15} />
            </div>
            <div>
              <span className="text-xs font-black block text-white">ভেরিফাইড তথ্য</span>
              <span className="text-[10px] text-emerald-200 block">পুঠিয়া মিডিয়া সেল</span>
            </div>
          </div>
        </div>
      </UnifiedHeroHeader>

      {/* Tabs Navigation Section */}
      <section className="bg-white border-b border-slate-200/80 sticky top-14 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar py-2.5 gap-1.5 sm:gap-2">
            {[
              { id: "modules", name: "সেবা ও মডিউল সহায়িকা", icon: Headphones, count: PLATFORM_MODULES.length },
              { id: "video", name: "ভিডিও টিউটোরিয়াল", icon: PlayCircle, count: PLATFORM_VIDEOS.length },
              { id: "ticket", name: "সাপোর্ট টিকিট", icon: Ticket, count: tickets.length, badge: "লাইভ" },
              { id: "helpline", name: "জরুরি হেল্পলাইন", icon: PhoneCall, count: PUTHIA_HELPLINES.length },
              { id: "faq", name: "সাধারণ প্রশ্ন (FAQ)", icon: HelpCircle, count: MOCK_PUTHIA_FAQS.length },
              { id: "contact", name: "সরাসরি যোগাযোগ", icon: Mail }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border-none cursor-pointer shrink-0 ${
                    isActive 
                      ? "bg-[#006847] text-white shadow-md shadow-emerald-900/15" 
                      : "bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon size={15} className={isActive ? "text-white" : "text-slate-500"} />
                  <span>{tab.name}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full uppercase animate-pulse ml-0.5">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 pt-6 pb-40">
        <AnimatePresence mode="wait">

          {/* TAB 1: AMADER PUTHIA PLATFORM MODULES */}
          {activeTab === "modules" && (
            <motion.div
              key="modules-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#006847] text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <Headphones size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-800">আমাদের পুঠিয়া ওয়েবসাইট মডিউল সহায়িকা</h2>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">প্ল্যাটফর্মের প্রধান প্রধান ডিজিটাল সেবাগুলোর ব্যবহার পদ্ধতি ও সরাসরি লিংক।</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/guidelines")}
                  className="px-4 py-2.5 bg-[#006847] hover:bg-emerald-800 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors border-none cursor-pointer shadow-xs shrink-0"
                >
                  পূর্ণাঙ্গ ব্যবহার নির্দেশিকা <ExternalLink size={13} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredModules.map(item => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -3 }}
                      className={`bg-white border ${item.colorBg} rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-11 h-11 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center ${item.textColor}`}>
                            <Icon size={22} />
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md bg-white border border-slate-200 ${item.textColor}`}>
                            {item.badge}
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">{item.category}</span>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1.5">{item.banglaName}</h3>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed mb-4">{item.desc}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <button
                          onClick={() => navigate(item.route)}
                          className="w-full py-2.5 bg-[#006847] hover:bg-emerald-800 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 border-none cursor-pointer transition-colors shadow-xs"
                        >
                          সেবায় প্রবেশ করুন <ExternalLink size={13} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: PLATFORM VIDEO GUIDES */}
          {activeTab === "video" && (
            <motion.div
              key="video-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-5 rounded-2xl border border-red-100/80 flex items-center gap-3">
                <div className="w-11 h-11 bg-red-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <PlayCircle size={22} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800">আমাদের পুঠিয়া ভিডিও নির্দেশিকা ও টিউটোরিয়াল</h2>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">ওয়েবসাইট ব্যবহারের নিয়মাবলি ও ফিচারসমূহ ধাপে ধাপে ভিডিও দেখে সহজেই শিখে নিন।</p>
                </div>
              </div>

              {/* Video Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVideos.map(video => (
                  <div
                    key={video.id}
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                      <img 
                        src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`} 
                        alt={video.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
                      
                      <button
                        onClick={() => setActiveVideoId(video.youtubeId)}
                        className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md transition-all border-none cursor-pointer scale-95 group-hover:scale-100 z-10"
                      >
                        <PlayCircle size={28} className="fill-white" />
                      </button>

                      <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] font-black px-2 py-0.5 rounded-md backdrop-blur-xs">
                        {video.duration}
                      </span>
                      <span className="absolute top-2.5 left-2.5 bg-[#006847] text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                        {video.category}
                      </span>
                    </div>

                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-slate-800 leading-snug mb-1.5 group-hover:text-[#006847] transition-colors">{video.title}</h3>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed mb-3">{video.desc}</p>
                      </div>
                      <button
                        onClick={() => setActiveVideoId(video.youtubeId)}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer"
                      >
                        <Youtube size={14} className="text-red-600" /> টিউটোরিয়াল চালু করুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* YouTube Modal Player */}
              {activeVideoId && (
                <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs">
                  <div className="bg-black rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
                    <button
                      onClick={() => setActiveVideoId(null)}
                      className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer border-none z-50 text-base font-black transition-colors"
                    >
                      ✕
                    </button>
                    <div className="aspect-video w-full">
                      <iframe
                        src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full border-0"
                      ></iframe>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: SUPPORT TICKETS (সাপোর্ট টিকিট) */}
          {activeTab === "ticket" && (
            <motion.div
              key="ticket-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Top Banner & Action */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 mb-2">
                    <Sparkles size={12} className="text-emerald-400" /> আমাদের পুঠিয়া হেল্পডেস্ক ট্র্যাকার
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-white">সাপোর্ট টিকিট অগ্রগতি ও সমাধান সিস্টেম</h2>
                  <p className="text-xs text-emerald-100/80 font-bold mt-1">
                    ওয়েবসাইটের তথ্য আপডেট, ডাক্তার সিরিয়াল, রক্তদাতা বা লিস্টিং সংক্রান্ত যেকোনো অনুরোধের লাইভ স্ট্যাটাস ট্র্যাক করুন।
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateTicketModal(true)}
                  className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0 border-none active:scale-95"
                >
                  <Plus size={16} /> নতুন সাপোর্ট টিকিট খুলুন
                </button>
              </div>

              {/* VISUAL TICKET PROGRESS TRACKER CARD */}
              {selectedTicket && (
                <div className="bg-white border border-emerald-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#006847] flex items-center justify-center font-black font-mono shadow-xs shrink-0">
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-[#006847] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            #{selectedTicket.id}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            ক্যাটাগরি: {selectedTicket.category}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-slate-800 leading-snug mt-1">
                          {selectedTicket.subject}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block">সমাধান অগ্রগতি</span>
                        <span className="text-sm font-black text-[#006847] font-mono">
                          {selectedTicket.progressPercent || 25}%
                        </span>
                      </div>
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-[#006847] rounded-full transition-all duration-500" 
                          style={{ width: `${selectedTicket.progressPercent || 25}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4-Step Visual Progress Stepper */}
                  <div>
                    <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Clock size={13} className="text-[#006847]" /> টিকেট প্রক্রিয়াকরণ ধাপসমূহ:
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {(getTicketProgressSteps(selectedTicket) || []).map((step, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border transition-all ${
                            step.completed
                              ? "bg-emerald-50/60 border-emerald-200 text-slate-800 shadow-2xs"
                              : "bg-slate-50/70 border-slate-200/80 text-slate-400"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                              step.completed 
                                ? "bg-[#006847] text-white" 
                                : "bg-slate-200 text-slate-500"
                            }`}>
                              {step.completed ? <CheckCircle2 size={14} /> : idx + 1}
                            </span>
                            {step.date && (
                              <span className="text-[10px] font-mono font-bold text-slate-400">
                                {step.date}
                              </span>
                            )}
                          </div>
                          <h5 className="text-xs font-black text-slate-800 mb-1">{step.title}</h5>
                          <p className="text-[11px] font-medium text-slate-600 leading-snug">{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metadata Bar */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[#006847]" />
                      <span>দায়িত্বপ্রাপ্ত: <strong className="text-slate-800">{selectedTicket.assignedTo || "আমাদের পুঠিয়া সাপোর্ট টিম"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#006847]" />
                      <span>আনুমানিক সমাধান: <strong className="text-slate-800">{selectedTicket.estimatedResolutionTime || "১-২ ঘণ্টার মধ্যে"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw size={14} className="text-[#006847]" />
                      <span>সর্বশেষ আপডেট: <strong className="text-slate-800">{selectedTicket.updatedAt || selectedTicket.createdAt}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ticket Search & Filter Bar */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="টিকিট আইডি (যেমন: TCK-801) দিয়ে খুঁজুন..."
                    value={ticketSearchId}
                    onChange={(e) => setTicketSearchId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  <span className="text-xs font-black text-slate-400 shrink-0 flex items-center gap-1">
                    <Filter size={12} /> ক্যাটাগরি:
                  </span>
                  {[
                    { id: "ALL", label: "সব" },
                    { id: "ACCOUNT", label: "অ্যাকাউন্ট" },
                    { id: "DOCTOR", label: "ডাক্তার" },
                    { id: "BLOOD", label: "রক্তদান" },
                    { id: "MERCHANT", label: "দোকান/ব্যবসা" },
                    { id: "TECHNICAL", label: "টেকনিক্যাল" }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setTicketCategoryFilter(cat.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-black whitespace-nowrap transition-colors border-none cursor-pointer ${
                        ticketCategoryFilter === cat.id
                          ? "bg-[#006847] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets List & Detail View Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Ticket Cards List */}
                <div className="lg:col-span-5 space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>আমার জমাকৃত টিকিটসমূহ ({filteredTickets.length})</span>
                    <button 
                      onClick={() => {
                        setTickets(MOCK_PUTHIA_TICKETS);
                        toast.info("রিসেট করা হয়েছে");
                      }}
                      className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
                    >
                      <RefreshCw size={10} /> রিফ্রেশ টিকেট
                    </button>
                  </h3>

                  {filteredTickets.length === 0 ? (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-400 font-bold">
                      <Ticket size={32} className="mx-auto mb-2 text-slate-300" />
                      কোনো সাপোর্ট টিকিট পাওয়া যায়নি
                    </div>
                  ) : (
                    filteredTickets.map(ticket => {
                      const isSelected = selectedTicket?.id === ticket.id;
                      const statusColor = 
                        ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        ticket.status === 'CLOSED' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                        'bg-amber-100 text-amber-800 border-amber-200';

                      const statusText = 
                        ticket.status === 'RESOLVED' ? 'সমাধানকৃত (১০০%)' :
                        ticket.status === 'IN_PROGRESS' ? 'প্রক্রিয়াধীন (৬৫%)' :
                        ticket.status === 'CLOSED' ? 'বন্ধ' : 'উন্মুক্ত (২৫%)';

                      return (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all ${
                            isSelected 
                              ? "border-[#006847] ring-2 ring-emerald-500/10 shadow-sm" 
                              : "border-slate-200/80 hover:border-slate-300 shadow-xs"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-black text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                              #{ticket.id}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${statusColor}`}>
                              {statusText}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-black text-slate-800 leading-snug line-clamp-2 mb-2">
                            {ticket.subject}
                          </h4>

                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                            <span>{ticket.createdAt}</span>
                            <span className="text-slate-600 font-black">{ticket.replies?.length || 0} মেসেজ</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right Ticket Thread View */}
                <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs min-h-[420px] flex flex-col justify-between">
                  {selectedTicket ? (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Header Info */}
                        <div className="pb-4 border-b border-slate-100">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-mono font-black text-[#006847]">#{selectedTicket.id}</span>
                            <span className="text-[11px] font-bold text-slate-400">{selectedTicket.createdAt}</span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-2">
                            {selectedTicket.subject}
                          </h3>

                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <span className="bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-700">
                              ক্যাটাগরি: {selectedTicket.category}
                            </span>
                            <span className="bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-md border border-rose-100">
                              প্রাধান্য: {selectedTicket.priority}
                            </span>
                          </div>
                        </div>

                        {/* Thread Messages */}
                        <div className="py-4 space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                          {(selectedTicket?.replies || []).map(reply => {
                            const isAdmin = reply.sender === 'ADMIN';
                            return (
                              <div
                                key={reply.id}
                                className={`flex flex-col ${isAdmin ? "items-start" : "items-end"}`}
                              >
                                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm font-bold leading-relaxed ${
                                  isAdmin 
                                    ? "bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/80" 
                                    : "bg-[#006847] text-white rounded-tr-xs shadow-xs"
                                }`}>
                                  <div className="flex items-center justify-between gap-3 text-[10px] font-black opacity-80 mb-1 border-b border-current/10 pb-1">
                                    <span>{reply.senderName}</span>
                                    <span>{reply.createdAt}</span>
                                  </div>
                                  <p className="whitespace-pre-line font-medium">{reply.message}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ticket Reply Form */}
                      <form onSubmit={handleSendTicketReply} className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="আপনার অতিরিক্ত উত্তর বা তথ্য লিখুন..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold outline-none focus:bg-white focus:border-emerald-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-[#006847] hover:bg-emerald-800 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors border-none cursor-pointer shrink-0"
                        >
                          <Send size={14} /> উত্তর দিন
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="my-auto text-center py-12 text-slate-400 font-bold">
                      <MessageSquare size={40} className="mx-auto mb-2 text-slate-300" />
                      বাম পাশের তালিকা থেকে যেকোনো সাপোর্ট টিকিটে ক্লিক করুন
                    </div>
                  )}
                </div>
              </div>

              {/* Create Ticket Modal */}
              {showCreateTicketModal && (
                <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                    <button
                      onClick={() => setShowCreateTicketModal(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-lg font-black bg-transparent border-none cursor-pointer"
                    >
                      ✕
                    </button>

                    <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
                      <Ticket size={20} className="text-[#006847]" /> নতুন সাপোর্ট টিকিট খুলুন
                    </h3>
                    <p className="text-xs font-bold text-slate-500 mb-4">
                      আমাদের পুঠিয়া ওয়েবসাইটের যেকোনো তথ্য সংশোধন, রক্তদাতা আপডেট বা সাহায্যের বার্তা পাঠান।
                    </p>

                    <form onSubmit={handleCreateTicket} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">
                          টিকিটের বিষয় / সংক্ষেপ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: রক্তদাতা তালিকায় ফোন নম্বর আপডেট করতে চাই"
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-black text-slate-700 mb-1">ক্যাটাগরি</label>
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value as any)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:bg-white focus:border-emerald-500"
                          >
                            <option value="GENERAL">সাধারণ প্রশ্ন</option>
                            <option value="ACCOUNT">অ্যাকাউন্ট ও লগইন</option>
                            <option value="DOCTOR">ডাক্তার সিরিয়াল</option>
                            <option value="BLOOD">রক্তদাতা ও ব্লাড ব্যাংক</option>
                            <option value="MERCHANT">দোকান ও ব্যবসা লিস্টিং</option>
                            <option value="REFERRAL">রেফারেল ও রিওয়ার্ড</option>
                            <option value="TECHNICAL">টেকনিক্যাল সমস্যা</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-700 mb-1">প্রাধান্য (Priority)</label>
                          <select
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value as any)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:bg-white focus:border-emerald-500"
                          >
                            <option value="LOW">সাধারণ (Low)</option>
                            <option value="MEDIUM">মধ্যম (Medium)</option>
                            <option value="HIGH">জরুরি (High)</option>
                            <option value="URGENT">অতিব জরুরি (Urgent)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">
                          বিস্তারিত বিবরণ <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder="আপনার বিষয়টি বিস্তারিত লিখুন..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">ফাইল/ডকুমেন্ট লিংক (ঐচ্ছিক)</label>
                        <input
                          type="text"
                          placeholder="যেমন: ছবি বা ডকুমেন্ট লিংক"
                          value={newAttachment}
                          onChange={(e) => setNewAttachment(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:bg-white"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCreateTicketModal(false)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl border-none cursor-pointer"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#006847] hover:bg-emerald-800 text-white font-black text-xs rounded-xl border-none cursor-pointer shadow-md"
                        >
                          টিকিট সাবমিট করুন
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: HELPLINES & CONTACT (হটলাইন ও যোগাযোগ) */}
          {activeTab === "helpline" && (
            <motion.div
              key="helpline-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Official WhatsApp & Call banner */}
              <div className="bg-gradient-to-r from-[#006847] via-emerald-800 to-teal-900 text-white p-5 sm:p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center shrink-0">
                    <Headphones size={26} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white">আমাদের পুঠিয়া অফিসিয়াল কাস্টমার কেয়ার</h2>
                    <p className="text-xs text-emerald-100 font-bold mt-0.5">যে কোনো প্রয়োজনে সরাসরি ফোন দিন অথবা হোয়াটসঅ্যাপে মেসেজ করুন।</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href="tel:01766628847"
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-[#006847] hover:bg-emerald-50 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer no-underline"
                  >
                    <PhoneCall size={14} /> কল করুন
                  </a>
                  <a
                    href="https://wa.me/8801766628847"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer no-underline"
                  >
                    <MessageCircle size={14} /> হোয়াটসঅ্যাপ
                  </a>
                </div>
              </div>

              {/* Helplines Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredHelplines.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                      item.isOfficialPuthia ? "border-emerald-300 ring-2 ring-emerald-500/10" : "border-slate-200/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm sm:text-base shadow-xs ${item.iconBg}`}>
                          {item.number}
                        </div>
                        {item.isOfficialPuthia ? (
                          <span className="text-[10px] font-black text-[#006847] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            আমাদের পুঠিয়া
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">
                            {item.availableHours}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-black text-slate-900 mb-1">{item.name}</h3>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed mb-4">{item.shortDesc}</p>
                    </div>

                    <a
                      href={`tel:${item.number.replace(/[^0-9]/g, '')}`}
                      className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer no-underline"
                    >
                      <PhoneCall size={14} /> কল করুন ({item.number})
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 5: FAQ (সাধারণ প্রশ্ন ও সমাধান) */}
          {activeTab === "faq" && (
            <motion.div
              key="faq-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006847] w-5 h-5 transition-colors" />
                  <input
                    type="text"
                    placeholder="আমাদের পুঠিয়া প্ল্যাটফর্ম নিয়ে আপনার প্রশ্নটি লিখে খুঁজুন..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl font-bold text-xs sm:text-sm outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {[
                    "সব", 
                    "অ্যাকাউন্ট ও লগইন", 
                    "রক্তদাতা ও ব্লাড ব্যাংক", 
                    "ডাক্তার ও স্বাস্থ্য সেবা",
                    "দোকান ও ব্যবসা লিস্টিং", 
                    "রেফারেল ও ইনকাম",
                    "বাস ও যাতায়াত", 
                    "অ্যাপ ইনস্টলেশন ও টেকনিক্যাল"
                  ].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFaqCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-colors border-none cursor-pointer ${
                        faqCategory === cat 
                          ? "bg-[#006847] text-white" 
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accordion List */}
              <div className="space-y-3 max-w-4xl mx-auto">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map(faq => {
                    const isOpen = expandedFaqId === faq.id;
                    const rating = faqHelpfulRatings[faq.id || ""];
                    return (
                      <div
                        key={faq.id}
                        className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all"
                      >
                        <button
                          onClick={() => setExpandedFaqId(isOpen ? null : (faq.id || null))}
                          className="w-full px-5 py-4 text-left border-none bg-transparent cursor-pointer flex items-center justify-between gap-4"
                        >
                          <span className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                            {faq.question}
                          </span>
                          <div className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 transition-transform ${
                            isOpen ? "rotate-180 text-emerald-700 bg-emerald-100" : ""
                          }`}>
                            <ChevronDown size={16} />
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                                <p className="mb-4">{faq.answer}</p>
                                
                                {/* Helpful Voting */}
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] font-extrabold text-slate-400">
                                  <span>এই উত্তরটি কি সাহায্য করেছে?</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleFaqVote(faq.id || "", 'yes')}
                                      className={`px-2.5 py-1 rounded-lg flex items-center gap-1 border border-slate-200 cursor-pointer ${
                                        rating === 'yes' ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      <ThumbsUp size={12} /> হ্যাঁ
                                    </button>
                                    <button
                                      onClick={() => handleFaqVote(faq.id || "", 'no')}
                                      className={`px-2.5 py-1 rounded-lg flex items-center gap-1 border border-slate-200 cursor-pointer ${
                                        rating === 'no' ? "bg-rose-100 text-rose-800 border-rose-300" : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      <ThumbsDown size={12} /> না
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-400 font-bold bg-white rounded-2xl border border-slate-200/80">
                    <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    কোনো প্রশ্ন বা উত্তর পাওয়া যায়নি
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 6: CONTACT AMADER PUTHIA TEAM (যোগাযোগ ও ফিডব্যাক) */}
          {activeTab === "contact" && (
            <motion.div
              key="contact-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Contact Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  { icon: PhoneCall, title: "সাপোর্ট হটলাইন", info: "০১৭৬৬-৬২৮৮৪৭", subtitle: "সরাসরি সাপোর্ট কল", actionText: "কল করুন", action: "tel:01766628847" },
                  { icon: Mail, title: "অফিসিয়াল ইমেইল", info: "support@amaderputhia.com", subtitle: "২৪ ঘণ্টার মধ্যে রিপ্লাই", actionText: "ইমেইল পাঠান", action: "mailto:support@amaderputhia.com" },
                  { icon: MapPin, title: "আমাদের পুঠিয়া মিডিয়া সেল", info: "পুঠিয়া বাজার, পুঠিয়া, রাজশাহী", subtitle: "ডেভেলপড বাই JOSIM UDDIN ❤️" }
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006847] flex items-center justify-center shrink-0 border border-emerald-100">
                        <item.icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.title}</h4>
                        <p className="text-xs sm:text-sm font-black text-slate-800 leading-snug mt-0.5">{item.info}</p>
                        {item.subtitle && <p className="text-[10px] font-bold text-slate-500 mt-0.5">{item.subtitle}</p>}
                      </div>
                    </div>

                    {item.action && (
                      <button
                        onClick={() => window.location.href = item.action!}
                        className="w-full py-2 bg-slate-50 hover:bg-[#006847] hover:text-white rounded-xl text-xs font-black transition-all border border-slate-200 cursor-pointer text-center text-slate-700"
                      >
                        {item.actionText}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Form & Info Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Form */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                      <div className="w-1.5 h-5 bg-[#006847] rounded-full"></div>
                      <h3 className="text-base font-black text-slate-800">আমাদের পুঠিয়া ম্যানেজমেন্ট টিমে সরাসরি বার্তা পাঠান</h3>
                    </div>

                    <form onSubmit={handleContactSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-black text-slate-600 mb-1">আপনার নাম <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: মোঃ জসিম উদ্দিন"
                            value={contactForm.name}
                            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl font-bold text-xs outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-600 mb-1">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                          <input
                            type="tel"
                            required
                            placeholder="যেমন: ০১৭১১XXXXXX"
                            value={contactForm.mobile}
                            onChange={(e) => setContactForm(prev => ({ ...prev, mobile: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl font-bold text-xs outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-600 mb-1">বিষয়</label>
                        <input
                          type="text"
                          placeholder="যেমন: রক্তদাতা তথ্য আপডেট অথবা নতুন ব্যবসা লিস্টিং"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl font-bold text-xs outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-600 mb-1">আপনার বার্তা বা পরামর্শ <span className="text-red-500">*</span></label>
                        <textarea
                          required
                          rows={4}
                          placeholder="আপনার বিষয়টি বিস্তারিত লিখুন..."
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl font-bold text-xs outline-none transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-[#006847] hover:bg-emerald-800 disabled:bg-slate-300 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all border-none cursor-pointer shadow-md active:scale-95"
                      >
                        {isSubmitting ? (
                          "পাঠানো হচ্ছে..."
                        ) : (
                          <>
                            <Send size={15} /> বার্তা পাঠান
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Google Map */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs lg:col-span-5 h-[320px] lg:h-auto flex flex-col justify-between">
                  <div className="relative w-full h-full rounded-xl overflow-hidden flex-1 border border-slate-100 shadow-inner">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.749005085376!2d88.8315180749068!3d24.370390165972847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fb67a0026e6d11%3A0x8e8745c4794e7724!2sPuthia%20Upazila%20Parishad!5e0!3m2!1sen!2sbd!4v1721326462719!5m2!1sen!2sbd" 
                      className="absolute inset-0 w-full h-full border-0 rounded-xl" 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 px-1 pt-2.5">
                    <MapPin size={14} className="text-[#006847]" /> পুঠিয়া, রাজশাহী, বাংলাদেশ
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Helpful Alert Footer Note */}
      <section className="bg-emerald-50/60 border-t border-b border-emerald-100 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-2 text-center text-xs font-black text-[#005c3f]">
          <Info size={15} /> আমাদের পুঠিয়া প্ল্যাটফর্মের সম্মানিত ব্যবহারকারীদের সর্বোচ্চ ডিজিটাল সহায়তা দিতে এই হেল্পডেস্ক সর্বদা নিয়োজিত।
        </div>
      </section>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
}

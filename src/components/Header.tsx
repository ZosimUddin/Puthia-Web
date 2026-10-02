import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useSettings } from "../contexts/SettingsContext";
import { NoticeItem } from "../types";
import { getNoticeItems } from "../api";
import defaultAppLogo from "../assets/images/puthia_official_icon_logo.jpg";
import { AuthModal } from "./AuthModal";
import { VoiceSearch } from "./VoiceSearch";
import {
  BarChart,
  MapPin,
  Star,
  ScrollText,
  Navigation,
  Monitor,
  Download,
  Globe,
  MessageSquare,
  Zap,
  Activity,
  Leaf,
  ShoppingBag,
  Building,
  PhoneCall,
  Droplet,
  Scale,
  Newspaper,
  CalendarDays,
  Megaphone,
  Image as ImageIcon,
  GraduationCap,
  Edit,
  Trophy,
  Camera,
  Users,
  Hotel,
  Castle,
  Search,
  Compass,
  GitCompare,
  MessageSquareCode,
  School,
  Sparkles,
  Map,
  Moon,
  Sun,
  LayoutGrid,
  Building2,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Landmark,
  FileText,
  Phone,
  HelpCircle,
  Home,
  Store,
  Briefcase,
  Award,
  FileSignature,
  Link,
  Car,
  CheckCircle,
  ShoppingCart,
  Recycle,
  AlertCircle,
  Bus,
  Train,
  Banknote,
  Medal,
  BookOpen,
  Book,
  BookText,
  BookHeart,
  Library,
  Clock,
  Wrench,
  Bookmark,
  Calculator,
  HeartPulse,
  Smartphone,
  Bike,
  Box,
  Tractor,
  Armchair,
  Info,
  List,
  Flame,
  Shield,
  User,
  Pin,
  Wallet,
  CreditCard,
  HandCoins,
  Heart,
  Bug,
  Calendar,
  Pill,
  Shirt,
  Cake,
  Diamond,
  Bird,
  Video,
  Sprout,
  Network,
  ShieldCheck,
  Truck,
  Music,
  Baby,
  Lightbulb,
  Hammer,
  PawPrint,
  CloudSun,
  Coins,
  ClipboardList,
  Stethoscope,
  UsersRound,
  LogOut,
  Facebook,
  Twitter,
  Youtube,
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  selectedSubView: string | null;
  setSelectedSubView: (view: string | null) => void;
  onSearch: (searchTerm: string) => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  selectedSubView,
  setSelectedSubView,
  onSearch,
}: HeaderProps) {
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const { settings } = useSettings();
  const isOnline = useNetworkStatus();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [mobExpandedDropdown, setMobExpandedDropdown] = useState<string | null>(
    null,
  );
  const [mobSearchQuery, setMobSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(["বানেশ্বর হাট", "পুঠিয়া হাসপাতাল", "জমি নামজারি"]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isTickerPaused, setIsTickerPaused] = useState(false);
  const [tickerTouchTimeout, setTickerTouchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (tickerTouchTimeout) clearTimeout(tickerTouchTimeout);
    };
  }, [tickerTouchTimeout]);

  useEffect(() => {
    const handleOpenAuthModal = () => setIsAuthModalOpen(true);
    window.addEventListener("open-auth-modal", handleOpenAuthModal);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuthModal);
  }, []);

  useEffect(() => {
    if (searchVal.length > 0) {
      const allItems = navigationMenu.flatMap((cat) => cat.items);
      const filtered = allItems.filter((item) =>
        item.label.toLowerCase().includes(searchVal.toLowerCase()),
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchVal]);

  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "bn-BD";
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchVal(transcript);
        onSearch(transcript);
        setSelectedSubView(null);
      };
      recognition.start();
    } else {
      alert("আপনার ব্রাউজারে ভয়েস সার্চ সাপোর্ট করে না।");
    }
  };

  useEffect(() => {
    // Check initial state from document
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    // Fetch active notices
    const loadNotices = async () => {
      const data = await getNoticeItems();
      setNotices(data.filter((n) => n.isActive));
    };
    loadNotices();
  }, []);

  const toolsMenu = [
    {
      id: "all",
      title: "সব টুল ও ক্যালকুলেটর",
      subtitle: "জমি, কৃষি, নির্মাণ ও যাকাত",
      icon: <Wrench className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-100/50",
      action: () => {
        navigate('/tools');
        setIsToolsMenuOpen(false);
      },
    },
    {
      id: "hubs",
      title: "দরকারি রিসোর্স হাব",
      subtitle: "সরকারি সেবা, ভূমি, কৃষি ও জরুরি ...",
      icon: <Bookmark className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-100/50",
      action: () => {
        navigate('/resources');
        setIsToolsMenuOpen(false);
      },
    },
    {
      id: "download_center",
      title: "ডাউনলোড সেন্টার",
      subtitle: "আবেদন ফরম ও গুরুত্বপূর্ণ PDF",
      icon: <Download className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-100/50",
      action: () => {
        navigate('/downloads');
        setIsToolsMenuOpen(false);
        setIsMobileMenuOpen(false);
      },
    },
    {
      id: "complaints_suggestions",
      title: "অভিযোগ ও পরামর্শ",
      subtitle: "আপনার মতামত বা অভিযোগ সরাসরি জানান",
      icon: <MessageSquare className="w-5 h-5 text-rose-600" />,
      bg: "bg-rose-100/50",
      action: () => {
        navigate('/complaint');
        setIsToolsMenuOpen(false);
        setIsMobileMenuOpen(false);
      },
    },
    {
      id: "exclusive_features",
      title: "এক্সক্লুসিভ ফিচার",
      subtitle: "ডিজিটাল পরিচিতি, হারানো-পাওয়া ও অন্যান্য",
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      bg: "bg-amber-100/50",
      action: () => {
        navigate('/exclusive-features');
        setIsToolsMenuOpen(false);
        setIsMobileMenuOpen(false);
      },
    },
    {
      id: "admin_portal",
      title: "অ্যাডমিন ও সুপার অ্যাডমিন পোর্টাল",
      subtitle: "মাস্টার কন্ট্রোল প্যানেল ও অ্যাডমিন লগইন",
      icon: <Shield className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-100/60",
      action: () => {
        navigate('/super-admin/login');
        setIsToolsMenuOpen(false);
        setIsMobileMenuOpen(false);
      },
    },
    {
      id: "play_app",
      title: "গুগল প্লে অ্যাপ",
      subtitle: "আমার গ্রাম অ্যান্ড্রয়েড অ্যাপ",
      icon: <Smartphone className="w-5 h-5 text-green-600" />,
      bg: "bg-green-100/50",
      action: () => {
        window.alert("অ্যাপটি এখনও প্লে স্টোরে উন্মুক্ত হয়নি।");
        setIsToolsMenuOpen(false);
        setIsMobileMenuOpen(false);
      },
    },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const openProfileTab = (tabId: string) => {
    setActiveTab("directory");
    setSelectedSubView("profile");
    setIsProfileMenuOpen(false);
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("changeProfileTab", { detail: tabId }),
      );
    }, 100);
  };

  // Dynamic Greetings
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return "শুভ সকাল ☀️";
    if (hr >= 12 && hr < 17) return "শুভ দুপুর ☀️";
    if (hr >= 17 && hr < 19) return "শুভ বিকাল 🌅";
    return "শুভ সন্ধ্যা 🌙";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch(searchVal.trim());
      setSelectedSubView(null); // Clear subview on active search to show results in main tab
    }
  };

  const onVoiceResult = (text: string) => {
    setSearchVal(text);
    onSearch(text);
    setSelectedSubView(null);
  };

  const navigationMenu = [
    {
      id: "administration",
      label: "উপজেলা ও প্রশাসন (৫)",
      iconName: "Building2",
      items: [
        {
          id: "upazila_intro_grid",
          label: "উপজেলা পরিচিতি",
          subIconName: "Info",
        },
        { id: "unions", label: "ইউনিয়ন", subIconName: "MapPin" },
        { id: "villages", label: "গ্রাম তথ্যভাণ্ডার", subIconName: "Home" },
        { id: "official_maps", label: "মানচিত্র ও সীমানা", subIconName: "Map" },
        {
          id: "chairman_contact",
          label: "জনপ্রতিনিধি ও প্রশাসন",
          subIconName: "Users",
        },
      ],
    },
    {
      id: "tourism_heritage",
      label: "ইতিহাস ও পর্যটন (৭)",
      iconName: "Camera",
      items: [
        {
          id: "puthia_rajbari",
          label: "পুঠিয়া রাজবাড়ী",
          subIconName: "Landmark",
        },
        { id: "temples", label: "মন্দির", subIconName: "Castle" },
        {
          id: "historical_places",
          label: "ঐতিহাসিক স্থান",
          subIconName: "MapPin",
        },
        { id: "travel_guide", label: "ভ্রমণ গাইড", subIconName: "Compass" },
        {
          id: "hotel_transport_info",
          label: "হোটেল ও যাতায়াত তথ্য",
          subIconName: "Hotel",
        },
        {
          id: "tourism_photo_gallery",
          label: "ছবি গ্যালারি",
          subIconName: "ImageIcon",
        },
        {
          id: "tourism_video_gallery",
          label: "ভিডিও গ্যালারি",
          subIconName: "Monitor",
        },
      ],
    },
    {
      id: "religious_social",
      label: "সামাজিক প্রতিষ্ঠান (৫)",
      iconName: "Book",
      items: [
        { id: "mosque", label: "মসজিদ", subIconName: "Moon" },
        { id: "eidgah", label: "ঈদগাহ", subIconName: "Sun" },
        { id: "graveyard", label: "কবরস্থান", subIconName: "MapPin" },
        {
          id: "religious_events",
          label: "ধর্মীয় অনুষ্ঠান",
          subIconName: "CalendarDays",
        },
        { id: "orphanage", label: "এতিমখানা", subIconName: "Building" },
      ],
    },
    {
      id: "blood_network",
      label: "রক্তদাতা নেটওয়ার্ক (৫)",
      iconName: "HeartPulse",
      items: [
        {
          id: "blood_donor_list",
          label: "রক্তদাতা তালিকা",
          subIconName: "List",
        },
        {
          id: "search_blood_group",
          label: "রক্তের গ্রুপ অনুসন্ধান",
          subIconName: "Search",
        },
        {
          id: "emergency_blood",
          label: "জরুরি রক্ত প্রয়োজন",
          subIconName: "AlertCircle",
        },
        {
          id: "blood_donation_reg",
          label: "রক্তদান নিবন্ধন",
          subIconName: "Edit",
        },
        {
          id: "blood_donation_history",
          label: "সফল রক্তদান ইতিহাস",
          subIconName: "History",
        },
      ],
    },
    {
      id: "edu_corner",
      label: "শিক্ষা প্রতিষ্ঠান (৭)",
      iconName: "School",
      items: [
        { id: "edu_school", label: "স্কুল", subIconName: "School" },
        { id: "edu_college", label: "কলেজ", subIconName: "GraduationCap" },
        { id: "edu_madrasha", label: "মাদ্রাসা", subIconName: "BookText" },
        { id: "edu_technical", label: "কারিগরি শিক্ষা", subIconName: "Wrench" },
        {
          id: "edu_kindergarten",
          label: "কিন্ডারগার্টেন",
          subIconName: "Baby",
        },
        { id: "edu_coaching", label: "কোচিং সেন্টার", subIconName: "Edit" },
        { id: "edu_library", label: "লাইব্রেরি", subIconName: "Library" },
      ],
    },
    {
      id: "agri_info",
      label: "কৃষি খামার ও আবহাওয়া (১৩+)",
      iconName: "Leaf",
      items: [
        { id: "agri_weather", label: "আবহাওয়া", subIconName: "CloudSun" },
        {
          id: "agri_advice",
          label: "ফসল চাষের পরামর্শ",
          subIconName: "Sprout",
        },
        { id: "agri_prices", label: "বাজারদর", subIconName: "Coins" },
        {
          id: "agri_officers",
          label: "কৃষি কর্মকর্তার যোগাযোগ",
          subIconName: "Users",
        },
        {
          id: "livestock_poultry",
          label: "প্রাণিসম্পদ",
          subIconName: "PawPrint",
        },
        { id: "agri_fish_farm", label: "মৎস্য খামার", subIconName: "Fish" },
        {
          id: "agri_video_training",
          label: "কৃষি ভিডিও/প্রশিক্ষণ",
          subIconName: "Video",
        },
        { id: "local_nursery", label: "নার্সারি", subIconName: "Sprout" },
        {
          id: "agri_loans",
          label: "কৃষি ঋণ ও প্রণোদনা",
          subIconName: "Banknote",
        },
        { id: "agri_diseases", label: "রোগবালাই পরামর্শ", subIconName: "Bug" },
        {
          id: "agri_machinery",
          label: "কৃষি যন্ত্রপাতি",
          subIconName: "Tractor",
        },
        {
          id: "agri_dealers",
          label: "সার ও বীজের ডিলার",
          subIconName: "Store",
        },
        {
          id: "agri_calendar",
          label: "ফসল ক্যালেন্ডার",
          subIconName: "Calendar",
        },
      ],
    },
    {
      id: "service_providers_menu",
      label: "সেবা প্রদানকারী (৭)",
      iconName: "Wrench",
      items: [
        {
          id: "sp_construction",
          label: "নির্মাণ ও ডেকোরেশন",
          subIconName: "Hammer",
        },
        {
          id: "sp_plumbing",
          label: "টিউবওয়েল ও স্যানিটারি",
          subIconName: "Droplet",
        },
        {
          id: "sp_electronics",
          label: "ইলেকট্রনিক্স সার্ভিসিং",
          subIconName: "Monitor",
        },
        {
          id: "sp_technical",
          label: "টেকনিক্যাল সার্ভিস",
          subIconName: "Wrench",
        },
        { id: "sp_vehicle", label: "গাড়ি ও বাইক মেকানিক", subIconName: "Car" },
        { id: "sp_lawyer", label: "আইনজীবী", subIconName: "Scale" },
        { id: "sp_journalist", label: "সাংবাদিক", subIconName: "Newspaper" },
      ],
    },
    {
      id: "business_economy",
      label: "ব্যবসা ও বাজার (১৩+)",
      iconName: "Store",
      items: [
        {
          id: "shop_grocery",
          label: "সুপার শপ / মুদি দোকান",
          subIconName: "ShoppingCart",
        },
        { id: "shop_pharmacy", label: "ফার্মেসি", subIconName: "Pill" },
        {
          id: "shop_mobile_computer",
          label: "মোবাইল ও কম্পিউটার দোকান",
          subIconName: "Smartphone",
        },
        { id: "shop_electronics", label: "ইলেকট্রনিক্স", subIconName: "Zap" },
        {
          id: "shop_clothing_cosmetics",
          label: "বস্ত্র ও কসমেটিকস",
          subIconName: "Shirt",
        },
        { id: "shop_furniture", label: "ফার্নিচার", subIconName: "Armchair" },
        {
          id: "shop_hardware_sanitary",
          label: "হার্ডওয়্যার ও স্যানিটারি",
          subIconName: "Wrench",
        },
        {
          id: "shop_agri_supplies",
          label: "কৃষি উপকরণের দোকান",
          subIconName: "Leaf",
        },
        {
          id: "shop_sweets_bakery",
          label: "মিষ্টির দোকান ও বেকারি",
          subIconName: "Cake",
        },
        { id: "shop_jewelry", label: "জুয়েলারি", subIconName: "Diamond" },
        {
          id: "shop_books_stationery",
          label: "বই ও স্টেশনারি",
          subIconName: "Book",
        },
        {
          id: "shop_vet_feed",
          label: "পশুখাদ্য ও ভেট শপ",
          subIconName: "Bird",
        },
        {
          id: "shop_mall_market",
          label: "শপিং মল / মার্কেট",
          subIconName: "ShoppingBag",
        },
      ],
    },
    {
      id: "banking_finance_menu",
      label: "ব্যাংক ও আর্থিক সেবা (৫)",
      iconName: "Landmark",
      items: [
        {
          id: "banking_finance_govt",
          label: "সরকারি ব্যাংক",
          subIconName: "Landmark",
        },
        {
          id: "banking_finance_private",
          label: "বেসরকারি ব্যাংক",
          subIconName: "Building",
        },
        {
          id: "banking_finance_agent",
          label: "এজেন্ট ব্যাংকিং",
          subIconName: "Users",
        },
        {
          id: "banking_finance_atm",
          label: "ATM বুথ",
          subIconName: "CreditCard",
        },
        {
          id: "banking_finance_mfs",
          label: "মোবাইল ব্যাংকিং",
          subIconName: "Smartphone",
        },
      ],
    },
    {
      id: "ngo_social_menu",
      label: "এনজিও ও সামাজিক উন্নয়ন (৮)",
      iconName: "Building2",
      items: [
        { id: "ngo_list", label: "এনজিও তালিকা", subIconName: "ClipboardList" },
        { id: "ngo_branch", label: "শাখার ঠিকানা", subIconName: "MapPin" },
        { id: "ngo_contact", label: "যোগাযোগ", subIconName: "PhoneCall" },
        { id: "ngo_loan", label: "ঋণ কর্মসূচি", subIconName: "HandCoins" },
        { id: "ngo_women", label: "নারী উন্নয়ন", subIconName: "Users" },
        { id: "ngo_agri", label: "কৃষি ও ক্ষুদ্র ব্যবসা", subIconName: "Leaf" },
        {
          id: "ngo_training",
          label: "প্রশিক্ষণ কর্মসূচি",
          subIconName: "GraduationCap",
        },
        { id: "ngo_services", label: "সামাজিক সেবা", subIconName: "Heart" },
      ],
    },
    {
      id: "emergency_contacts",
      label: "জরুরি সেবা (৮)",
      iconName: "Phone",
      items: [
        {
          id: "rural_electricity",
          label: "পল্লী বিদ্যুৎ অফিস",
          subIconName: "Zap",
        },
        {
          id: "veterinary_doctor",
          label: "ভেটেরিনারি ডাক্তার",
          subIconName: "Stethoscope",
        },
        { id: "police_contact", label: "পুলিশ", subIconName: "ShieldCheck" },
        {
          id: "fire_service_contact",
          label: "ফায়ার সার্ভিস",
          subIconName: "Flame",
        },
        {
          id: "emergency_ambulance",
          label: "অ্যাম্বুলেন্স",
          subIconName: "Activity",
        },
        {
          id: "cyber_helpline",
          label: "সাইবার হেল্পলাইন",
          subIconName: "Globe",
        },
        {
          id: "women_children_help",
          label: "নারী ও শিশু সহায়তা",
          subIconName: "Users",
        },
        {
          id: "national_helpline",
          label: "জাতীয় হেল্পলাইন",
          subIconName: "PhoneCall",
        },
      ],
    },
    {
      id: "health_medical",
      label: "স্বাস্থ্যসেবা ও চিকিৎসা (৬)",
      iconName: "Activity",
      items: [
        { id: "hospital", label: "হাসপাতাল", subIconName: "Building" },
        { id: "clinic", label: "ক্লিনিক", subIconName: "Building" },
        { id: "doctor", label: "ডাক্তার", subIconName: "Users" },
        { id: "pharmacy", label: "ফার্মেসি", subIconName: "Store" },
        {
          id: "diagnostic",
          label: "ডায়াগনস্টিক সেন্টার",
          subIconName: "Search",
        },
        { id: "dental", label: "ডেন্টাল", subIconName: "Activity" },
      ],
    },
    {
      id: "youth_career",
      label: "ক্যারিয়ার ও শিক্ষা (৭)",
      iconName: "Briefcase",
      items: [
        { id: "job_circular", label: "চাকরির খবর", subIconName: "Briefcase" },
        {
          id: "education_coaching",
          label: "শিক্ষা ও কোচিং",
          subIconName: "BookOpen",
        },
        {
          id: "job_local_ads",
          label: "স্থানীয় চাকরির বিজ্ঞপ্তি",
          subIconName: "Newspaper",
        },
        {
          id: "job_freelance_res",
          label: "ফ্রিল্যান্সিং রিসোর্স",
          subIconName: "Globe",
        },
        {
          id: "job_training_news",
          label: "প্রশিক্ষণ কর্মশালার খবর",
          subIconName: "Megaphone",
        },
        {
          id: "education_scholarship",
          label: "স্কলারশিপ তথ্য",
          subIconName: "GraduationCap",
        },
        {
          id: "career_guideline",
          label: "ক্যারিয়ার গাইডলাইন",
          subIconName: "Lightbulb",
        },
      ],
    },
    {
      id: "transport_info",
      label: "পরিবহন তথ্য (৫)",
      iconName: "Bus",
      items: [
        { id: "bus_schedule", label: "বাস সময়সূচী", subIconName: "Clock" },
        { id: "train_info", label: "ট্রেন তথ্য", subIconName: "Train" },
        { id: "fare_list", label: "ভাড়া তালিকা", subIconName: "Banknote" },
        {
          id: "van_auto_info",
          label: "ভ্যান ও অটোরিকশা",
          subIconName: "Truck",
        },
        {
          id: "bus_counter_emergency",
          label: "বাস কাউন্টার জরুরি নম্বর",
          subIconName: "Bus",
        },
      ],
    },
    {
      id: "community_engagement",
      label: "কমিউনিটি ও ইভেন্ট (৭)",
      iconName: "MessageSquareCode",
      items: [
        { id: "local_news", label: "স্থানীয় সংবাদ", subIconName: "Newspaper" },
        { id: "notice_board", label: "নোটিশ বোর্ড", subIconName: "Pin" },
        {
          id: "community_events_hub",
          label: "অনুষ্ঠান ও কার্যক্রম",
          subIconName: "Calendar",
        },
        {
          id: "social_organizations",
          label: "সামাজিক সংগঠন",
          subIconName: "UsersRound",
        },
        {
          id: "volunteer_network",
          label: "স্বেচ্ছাসেবক নেটওয়ার্ক",
          subIconName: "Network",
        },
        {
          id: "photo_video_gallery",
          label: "ছবি ও ভিডিও",
          subIconName: "Image",
        },
      ],
    },
  ];

  const getMenuIcon = (iconName: string) => {
    switch (iconName) {
      case "Landmark":
        return <Landmark className="w-3.5 h-3.5 text-rose-300" />;
      case "Compass":
        return <Compass className="w-3.5 h-3.5 text-teal-300" />;
      case "FileText":
        return <FileText className="w-3.5 h-3.5 text-emerald-300" />;
      case "School":
        return <School className="w-3.5 h-3.5 text-sky-300" />;
      case "Store":
        return <Store className="w-3.5 h-3.5 text-indigo-300" />;
      case "ShoppingCart":
        return <ShoppingCart className="w-3.5 h-3.5 text-orange-300" />;
      case "ShoppingBag":
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />;
      case "Home":
        return <Home className="w-3.5 h-3.5 text-emerald-300" />;
      case "Phone":
        return <Phone className="w-3.5 h-3.5 text-rose-400" />;
      case "Sparkles":
        return <Sparkles className="w-3.5 h-3.5 text-amber-300" />;
      case "Briefcase":
        return <Briefcase className="w-3.5 h-3.5 text-cyan-300" />;
      case "MessageSquareCode":
        return <MessageSquareCode className="w-3.5 h-3.5 text-fuchsia-300" />;
      case "Award":
        return <Award className="w-3.5 h-3.5 text-yellow-300" />;
      case "AlertCircle":
        return <AlertCircle className="w-3.5 h-3.5 text-red-300" />;
      case "Newspaper":
        return <Newspaper className="w-3.5 h-3.5 text-amber-200" />;
      case "CalendarDays":
        return <CalendarDays className="w-3.5 h-3.5 text-orange-400" />;
      case "PhoneCall":
        return <PhoneCall className="w-3.5 h-3.5 text-blue-300" />;
      case "Building2":
        return <Building2 className="w-3.5 h-3.5 text-indigo-300" />;
      case "Bus":
        return <Bus className="w-3.5 h-3.5 text-emerald-300" />;
      case "LayoutGrid":
        return <LayoutGrid className="w-3.5 h-3.5 text-indigo-300" />;
      case "Camera":
        return <Camera className="w-3.5 h-3.5 text-rose-300" />;
      case "Download":
        return <Download className="w-3.5 h-3.5 text-emerald-300" />;
      case "Book":
        return <Book className="w-3.5 h-3.5 text-emerald-300" />;
      case "MessageSquare":
        return <MessageSquare className="w-3.5 h-3.5 text-fuchsia-300" />;
      case "HeartPulse":
        return <HeartPulse className="w-3.5 h-3.5 text-red-400" />;
      case "Leaf":
        return <Leaf className="w-3.5 h-3.5 text-emerald-300" />;
      case "Activity":
        return <Activity className="w-3.5 h-3.5 text-rose-300" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-amber-300" />;
    }
  };

  const getMenuSubIcon = (iconName: string) => {
    const iconClass = "w-3.5 h-3.5 text-neutral-400";
    switch (iconName) {
      case "Recycle":
        return <Recycle className={iconClass} />;
      case "Pin":
        return <Pin className={iconClass} />;
      case "BarChart":
        return <BarChart className={iconClass} />;
      case "Home":
        return <Home className={iconClass} />;
      case "MapPin":
        return <MapPin className={iconClass} />;
      case "Map":
        return <Map className={iconClass} />;
      case "Landmark":
        return <Landmark className={iconClass} />;
      case "Castle":
        return <Castle className={iconClass} />;
      case "Hotel":
        return <Hotel className={iconClass} />;
      case "Users":
        return <Users className={iconClass} />;
      case "Star":
        return <Star className={iconClass} />;
      case "ScrollText":
        return <ScrollText className={iconClass} />;
      case "Navigation":
        return <Navigation className={iconClass} />;
      case "Monitor":
        return <Monitor className={iconClass} />;
      case "Download":
        return <Download className={iconClass} />;
      case "Globe":
        return <Globe className={iconClass} />;
      case "MessageSquare":
        return <MessageSquare className={iconClass} />;
      case "School":
        return <School className={iconClass} />;
      case "Zap":
        return <Zap className={iconClass} />;
      case "Activity":
        return <Activity className={iconClass} />;
      case "Leaf":
        return <Leaf className={iconClass} />;
      case "ShoppingBag":
        return <ShoppingBag className={iconClass} />;
      case "Store":
        return <Store className={iconClass} />;
      case "Building":
        return <Building className={iconClass} />;
      case "PhoneCall":
        return <PhoneCall className={iconClass} />;
      case "Droplet":
        return <Droplet className={iconClass} />;
      case "Scale":
        return <Scale className={iconClass} />;
      case "Newspaper":
        return <Newspaper className={iconClass} />;
      case "CalendarDays":
        return <CalendarDays className={iconClass} />;
      case "Megaphone":
        return <Megaphone className={iconClass} />;
      case "ImageIcon":
        return <ImageIcon className={iconClass} />;
      case "Briefcase":
        return <Briefcase className={iconClass} />;
      case "GraduationCap":
        return <GraduationCap className={iconClass} />;
      case "Edit":
        return <Edit className={iconClass} />;
      case "Search":
        return <Search className={iconClass} />;
      case "Trophy":
        return <Trophy className={iconClass} />;
      case "Camera":
        return <Camera className={iconClass} />;
      case "FileSignature":
        return <FileSignature className={iconClass} />;
      case "Link":
        return <Link className={iconClass} />;
      case "Train":
        return <Train className={iconClass} />;
      case "Banknote":
        return <Banknote className={iconClass} />;
      case "Bus":
        return <Bus className={iconClass} />;
      case "Car":
        return <Car className={iconClass} />;
      case "CheckCircle":
        return <CheckCircle className={iconClass} />;
      case "Compass":
        return <Compass className={iconClass} />;
      case "Award":
        return <Award className={iconClass} />;
      case "Image":
        return <ImageIcon className={iconClass} />;
      case "Phone":
        return <Phone className={iconClass} />;
      case "Medal":
        return <Medal className={iconClass} />;
      case "BookOpen":
        return <BookOpen className={iconClass} />;
      case "Smartphone":
        return <Smartphone className={iconClass} />;
      case "Bike":
        return <Bike className={iconClass} />;
      case "Box":
        return <Box className={iconClass} />;
      case "Tractor":
        return <Tractor className={iconClass} />;
      case "Armchair":
        return <Armchair className={iconClass} />;
      case "Info":
        return <Info className={iconClass} />;
      case "List":
        return <List className={iconClass} />;
      case "Sun":
        return <Sun className={iconClass} />;
      case "Clock":
        return <Clock className={iconClass} />;
      case "Bug":
        return <Bug className={iconClass} />;
      case "Calendar":
        return <Calendar className={iconClass} />;
      case "Wallet":
        return <Wallet className={iconClass} />;
      case "CreditCard":
        return <CreditCard className={iconClass} />;
      case "HandCoins":
        return <HandCoins className={iconClass} />;
      case "Heart":
        return <Heart className={iconClass} />;
      case "ShoppingCart":
        return <ShoppingCart className={iconClass} />;
      case "Pill":
        return <Pill className={iconClass} />;
      case "Shirt":
        return <Shirt className={iconClass} />;
      case "Cake":
        return <Cake className={iconClass} />;
      case "Diamond":
        return <Diamond className={iconClass} />;
      case "Bird":
        return <Bird className={iconClass} />;
      case "Video":
        return <Video className={iconClass} />;
      case "Sprout":
        return <Sprout className={iconClass} />;
      case "Network":
        return <Network className={iconClass} />;
      case "ShieldCheck":
        return <ShieldCheck className={iconClass} />;
      case "Truck":
        return <Truck className={iconClass} />;
      case "Music":
        return <Music className={iconClass} />;
      case "Wrench":
        return <Wrench className={iconClass} />;
      case "History":
        return <ScrollText className={iconClass} />;
      case "Fish":
        return <Droplet className={iconClass} />;
      case "Building2":
        return <Building2 className={iconClass} />;
      case "Moon":
        return <Moon className={iconClass} />;
      case "AlertCircle":
        return <AlertCircle className={iconClass} />;
      case "Baby":
        return <Baby className={iconClass} />;
      case "Flame":
        return <Flame className={iconClass} />;
      case "Lightbulb":
        return <Lightbulb className={iconClass} />;
      case "HeartPulse":
        return <HeartPulse className={iconClass} />;
      case "Book":
        return <Book className={iconClass} />;
      case "BookText":
        return <BookText className={iconClass} />;
      case "Library":
        return <Library className={iconClass} />;
      case "CloudSun":
        return <CloudSun className={iconClass} />;
      case "Coins":
        return <Coins className={iconClass} />;
      case "PawPrint":
        return <PawPrint className={iconClass} />;
      case "Hammer":
        return <Hammer className={iconClass} />;
      case "ClipboardList":
        return <ClipboardList className={iconClass} />;
      case "Stethoscope":
        return <Stethoscope className={iconClass} />;
      case "UsersRound":
        return <UsersRound className={iconClass} />;
      default:
        return null;
    }
  };

  const handleSubSelect = (viewId: string) => {
    setSelectedSubView(viewId);
    setIsMobileMenuOpen(false);
    // Smooth scroll back to content view top
    const container = document.getElementById("main-content-section");
    if (container) {
      container.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleGoHome = () => {
    setSelectedSubView(null);
    setActiveTab("directory");
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-emerald-900 text-white shadow-xl relative border-b border-emerald-700/60 z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          {/* Main App Title with Natural Tones Govt styling */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={handleGoHome}
            >
              <div className="w-[52px] h-[52px] rounded-2xl overflow-hidden bg-white/15 flex items-center justify-center border-2 border-white/30 p-0.5 shrink-0 shadow-md backdrop-blur-xs hover:scale-105 transition-transform">
                <img 
                  src={settings.logoUrl || defaultAppLogo} 
                  alt="আমাদের পুঠিয়া লোগো" 
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex flex-col justify-center gap-0.5">
                  <h1 className="text-[18px] sm:text-[24px] font-black tracking-tight font-sans text-white hover:text-amber-100 transition-colors leading-none truncate">
                    {settings.appName || "আমাদের পুঠিয়া"}
                  </h1>
                  <p className="text-[#fdfaf2]/95 text-[10px] sm:text-[12px] font-bold leading-none truncate tracking-wide">
                    তথ্য ও সেবা এখন হাতের মুঠোয়
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Mobile Hamburger */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (!isToolsMenuOpen) setActiveSubMenu(null);
                  setIsToolsMenuOpen(!isToolsMenuOpen);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/25 hover:bg-white/20 text-white cursor-pointer transition-all flex-shrink-0 shadow-xs"
                aria-label="Apps menu"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/25 hover:bg-white/20 text-white cursor-pointer transition-all flex-shrink-0 shadow-xs"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Puthia Smart Search Trigger */}
          <button
            onClick={() => setIsSearchOverlayOpen(true)}
            className="w-full md:w-80 flex items-center gap-2 pl-4 pr-4 py-3 bg-white/10 hover:bg-white/15 text-white placeholder-[#eeebe1] border border-white/20 hover:border-white/35 rounded-full cursor-pointer transition-all shadow-inner"
          >
            <Search className="w-5 h-5 text-white/70" />
            <span className="text-sm">গ্রাম, জনপ্রতিনিধি বা সেবা লিখে খুঁজুন...</span>
          </button>

          {/* Quick Puthia Smart Search Box */}
          <form onSubmit={handleSubmit} className="w-full md:w-80 hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="গ্রাম, জনপ্রতিনিধি বা সেবা লিখে খুঁজুন..."
                value={searchVal || ""}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-[56px] pr-28 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-[#1A1A1A] placeholder-[#eeebe1] focus:placeholder-neutral-500 border border-white/25 focus:border-emerald-300 rounded-full outline-none transition-all duration-300 font-sans shadow-inner text-base inline-block"
              />
              <Search className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none focus:text-neutral-500" />

              <VoiceSearch onResult={onVoiceResult} />

              {searchVal && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchVal("");
                  }}
                  className="absolute right-[74px] top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 rounded-full transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-full text-base transition-colors cursor-pointer shadow-sm min-h-[48px] flex items-center justify-center"
              >
                খুঁজুন
              </button>

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white text-neutral-800 rounded-xl mt-2 shadow-2xl z-[100] border border-neutral-200 overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSearchVal(s.label);
                        handleSubSelect(s.id);
                        setSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-sm font-medium border-b border-neutral-100 last:border-0"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Breaking News / Notice Ticker */}
        <div className="mt-2.5 flex items-center bg-white/10 rounded-full border border-white/20 overflow-hidden relative shadow-sm h-10">
          <div className="bg-emerald-700 text-white px-3.5 py-2 flex items-center gap-1.5 z-10 font-bold whitespace-nowrap shadow-[2px_0_5px_0_rgba(0,0,0,0.1)] text-xs md:text-sm">
            <Megaphone className="w-3.5 h-3.5 md:w-4 md:h-4 animate-pulse" />
            <span className="hidden min-[375px]:inline">নোটিশ</span>
          </div>

          <div 
            className="flex-1 overflow-hidden relative h-full flex items-center"
            onMouseEnter={() => setIsTickerPaused(true)}
            onMouseLeave={() => setIsTickerPaused(false)}
            onTouchStart={() => {
              setIsTickerPaused(true);
              if (tickerTouchTimeout) clearTimeout(tickerTouchTimeout);
              const timeout = setTimeout(() => setIsTickerPaused(false), 3000);
              setTickerTouchTimeout(timeout);
            }}
          >
            <div
              id="notice-ticker"
              className="animate-marquee flex whitespace-nowrap w-max items-center gap-8 text-white/90 text-xs md:text-sm font-medium pr-8"
              style={{ 
                animationPlayState: isTickerPaused ? "paused" : "running",
                animationDuration: "85s"
              }}
            >
              {notices.length > 0 ? (
                <>
                  {notices.map((notice) => (
                    <a
                      key={notice.id}
                      href={notice.link || "#"}
                      target={notice.link ? "_blank" : "_self"}
                      rel={notice.link ? "noopener noreferrer" : ""}
                      className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors shrink-0"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          notice.color === "emerald-400"
                            ? "bg-emerald-400"
                            : notice.color === "sky-400"
                              ? "bg-sky-400"
                              : notice.color === "rose-400"
                                ? "bg-rose-400"
                                : notice.color === "amber-400"
                                  ? "bg-amber-400"
                                  : "bg-purple-400"
                        }`}
                      ></span>
                      {notice.text}
                    </a>
                  ))}
                  {/* Duplicated for seamless scrolling */}
                  {notices.map((notice) => (
                    <a
                      key={`${notice.id}-dup`}
                      href={notice.link || "#"}
                      target={notice.link ? "_blank" : "_self"}
                      rel={notice.link ? "noopener noreferrer" : ""}
                      className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors shrink-0"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          notice.color === "emerald-400"
                            ? "bg-emerald-400"
                            : notice.color === "sky-400"
                              ? "bg-sky-400"
                              : notice.color === "rose-400"
                                ? "bg-rose-400"
                                : notice.color === "amber-400"
                                  ? "bg-amber-400"
                                  : "bg-purple-400"
                        }`}
                      ></span>
                      {notice.text}
                    </a>
                  ))}
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors shrink-0">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                    উপজেলা প্রশাসনের নতুন নির্দেশিকা প্রকাশ
                  </span>
                  <span className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors shrink-0">
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full"></span>
                    পৌরসভার পানি সরবরাহ বিজ্ঞপ্তি
                  </span>
                  <span className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors shrink-0">
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                    পি.এন. উচ্চ বিদ্যালয়ের ভর্তি বিজ্ঞপ্তি
                  </span>

                  {/* Duplicated for seamless scrolling */}
                  <span className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors shrink-0">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                    উপজেলা প্রশাসনের নতুন নির্দেশিকা প্রকাশ
                  </span>
                  <span className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors shrink-0">
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full"></span>
                    পৌরসভার পানি সরবরাহ বিজ্ঞপ্তি
                  </span>
                  <span className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors shrink-0">
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                    পি.এন. উচ্চ বিদ্যালয়ের ভর্তি বিজ্ঞপ্তি
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ==================== DESKTOP DROPDOWN NAVIGATION BAR ==================== */}
        <nav className="hidden md:flex flex-wrap items-center gap-1.5 mt-3 pb-1 relative z-50">
          {/* Main Dashboard home button */}
          <button
            onClick={handleGoHome}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-sm font-bold transition-all cursor-pointer ${
              selectedSubView === null && activeTab === "directory"
                ? "bg-white text-[#2d5a27] border-t-[3px] border-emerald-500 shadow-md font-extrabold"
                : "text-white/90 hover:text-white hover:bg-white/10"
            }`}
          >
            <Home className="w-3.5 h-3.5 text-emerald-600" />
            হোম পোর্টাল
          </button>

          {/* Map navigation items */}
          {navigationMenu.map((cat) => {
            const isCategoryActive =
              selectedSubView === cat.id ||
              cat.items.some(
                (item) =>
                  item.id === selectedSubView ||
                  (item.id === "tab_temples" &&
                    activeTab === "temples" &&
                    selectedSubView === null) ||
                  (item.id === "tab_travel" &&
                    activeTab === "travel" &&
                    selectedSubView === null) ||
                  (item.id === "tab_heritage" &&
                    activeTab === "heritage" &&
                    selectedSubView === null),
              );
            return (
              <div key={cat.id} className="relative group">
                <button
                  type="button"
                  onClick={() => handleSubSelect(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-sm font-bold transition-all cursor-pointer ${
                    isCategoryActive
                      ? "bg-white text-[#2d5a27] border-t-[3px] border-emerald-500 shadow-md font-extrabold"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {getMenuIcon(cat.iconName)}
                  <span>{cat.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80 group-hover:rotate-180 transition-transform duration-200" />
                </button>

                {/* Submenu Dropdown Container */}
                <div className="absolute left-0 mt-0 pt-1 w-64 bg-white rounded-b-2xl shadow-xl border-t border-neutral-100 hidden group-hover:block z-50 animate-fade-in duration-200 text-neutral-800">
                  <div className="p-1.5 space-y-0.5 bg-white rounded-b-2xl overflow-hidden">
                    {cat.items.map((sub, idx) => {
                      const isItemActive =
                        selectedSubView === sub.id ||
                        (sub.id === "tab_temples" &&
                          activeTab === "temples" &&
                          selectedSubView === null) ||
                        (sub.id === "tab_travel" &&
                          activeTab === "travel" &&
                          selectedSubView === null) ||
                        (sub.id === "tab_heritage" &&
                          activeTab === "heritage" &&
                          selectedSubView === null);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSubSelect(sub.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold font-sans transition-all block cursor-pointer flex items-center gap-2 pl-5 list-none ${
                            isItemActive
                              ? "bg-[#2d5a27] text-white shadow-xs font-bold font-sans"
                              : "hover:bg-neutral-50 text-neutral-700 hover:text-[#2d5a27]"
                          }`}
                        >
                          {getMenuSubIcon(sub.subIconName || "")}
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-0 bg-[#125836] z-[9999] overflow-y-auto pb-6">
          {!isOnline && (
            <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-bold shadow-lg">
              আপনি বর্তমানে অফলাইনে আছেন। ইন্টারনেট সংযোগ চেক করুন।
            </div>
          )}
          <div className="px-4 pt-5 pb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center border border-[#d4af37]/60">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-[20px] h-[20px]"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M50 10 L50 20"
                      stroke="#d4af37"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M40 45 L50 15 L60 45"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M45 45 L50 25 L55 45"
                      stroke="#d4af37"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M25 50 L30 30 L35 50"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M65 50 L70 30 L75 50"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 50 L85 50 L85 75 L15 75 Z"
                      stroke="#d4af37"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M30 75 L30 58 C30 53 40 53 40 58 L40 75"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M60 75 L60 58 C60 53 70 53 70 58 L70 75"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M45 75 L45 55 C45 50 55 50 55 55 L55 75"
                      stroke="#d4af37"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M10 75 L90 75"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M15 82 L85 82"
                      stroke="#d4af37"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg">
                  {settings.appName}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-12 h-12 flex items-center justify-center text-white bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="মেনু অনুসন্ধান..."
                  value={mobSearchQuery || ""}
                  onChange={(e) => setMobSearchQuery(e.target.value)}
                  className="w-full bg-[#114424] text-white text-sm rounded-xl py-3.5 pl-11 pr-10 border border-white/20 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 focus:bg-[#0E3B1E] transition-all shadow-inner focus:shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                />
                {mobSearchQuery && (
                  <button
                    onClick={() => setMobSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {navigationMenu
              .filter(
                (cat) =>
                  cat.label.includes(mobSearchQuery) ||
                  (cat.items &&
                    cat.items.some((sub) =>
                      sub.label.includes(mobSearchQuery),
                    )),
              )
              .map((cat) => (
                <motion.div
                  key={cat.id}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-xl overflow-hidden border-[0.5px] border-white/10 mb-3 shadow-md transition-colors duration-300 relative ${mobExpandedDropdown === cat.id ? "bg-[#114424] shadow-lg shadow-black/10" : "bg-white/5 hover:bg-white/10"}`}
                >
                  <button
                    onClick={() =>
                      setMobExpandedDropdown(
                        mobExpandedDropdown === cat.id ? null : cat.id,
                      )
                    }
                    className="w-full flex items-center justify-between p-4 text-white font-medium relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-white/5 opacity-0 group-active:opacity-100 transition-opacity duration-200"></span>
                    <span className="flex flex-col items-start gap-1 relative z-10">
                      <span className="flex items-center gap-3">
                        {getMenuIcon(cat.iconName)}
                        {cat.label.includes("(") ? (
                          <div className="flex items-center gap-2">
                            <span>{cat.label.split("(")[0].trim()}</span>
                            <span className="bg-emerald-500/10 text-white px-2 py-0.5 rounded-full text-[11px] font-bold border border-emerald-500/20 flex items-center justify-center min-w-[32px] gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]"></span>
                              {cat.label.split("(")[1].replace(")", "")}
                            </span>
                          </div>
                        ) : (
                          cat.label
                        )}
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-[22px] h-[22px] transition-transform duration-300 ease-in-out relative z-10 ${mobExpandedDropdown === cat.id ? "rotate-180 text-emerald-400" : "opacity-70"}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {mobExpandedDropdown === cat.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="bg-black/20 p-2 space-y-1 border-t border-white/[0.12] overflow-hidden origin-top"
                      >
                        {cat.items.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              handleSubSelect(sub.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full text-left py-3.5 pr-4 pl-12 text-white text-[15px] hover:bg-emerald-500/15 active:bg-emerald-500/25 rounded-xl flex items-center gap-3 transition-all duration-250 ease-out active:scale-[0.98] relative overflow-hidden group/sub ${selectedSubView === sub.id ? "bg-emerald-400/15 font-semibold" : "font-medium"}`}
                          >
                            <span className="absolute inset-0 bg-white/5 opacity-0 group-active/sub:opacity-100 transition-opacity duration-200"></span>
                            {selectedSubView === sub.id && (
                              <div className="absolute left-2 top-2 bottom-2 w-[4px] bg-emerald-400 rounded-full z-10 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                            )}
                            <span
                              className={`relative z-10 ${selectedSubView === sub.id ? "text-emerald-400" : "text-white/70"}`}
                            >
                              {getMenuSubIcon(sub.subIconName || "")}
                            </span>
                            <span className="relative z-10">{sub.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            <div className="pt-4 mt-4 border-t border-white/10 text-white/60 text-xs space-y-3 pb-2">
              <p>© ২০২৬ {settings.appName} | সর্বস্বত্ব সংরক্ষিত</p>
              <div className="flex items-center gap-3">
                <a
                  href="mailto:contact@ourputhia.com"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" /> contact@ourputhia.com
                </a>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 opacity-80 hover:opacity-100 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all active:scale-95 duration-200"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 opacity-80 hover:opacity-100 flex items-center justify-center hover:bg-sky-400 hover:text-white transition-all active:scale-95 duration-200"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 opacity-80 hover:opacity-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95 duration-200"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal (নাগরিক প্রোফাইল) */}
      {isProfileMenuOpen && (
        <div className="fixed inset-0 top-0 bg-[#125836] z-[9999] overflow-y-auto pb-20">
          <div className="px-4 py-4 space-y-4">
            <div className="flex justify-between items-center mb-6 pt-2">
              <div className="flex items-center gap-3 overflow-hidden pr-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-xl border-2 border-emerald-500/20 uppercase overflow-hidden shrink-0">
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    userProfile?.name?.charAt(0) || "U"
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-white font-bold text-base sm:text-lg leading-tight truncate">
                    {userProfile?.name || "ইউজার প্রোফাইল"}
                  </h2>
                  <p className="text-emerald-200 text-xs mt-0.5">
                    আইডি:{" "}
                    {userProfile?.uid
                      ? `PUT-${userProfile.uid.substring(0, 6).toUpperCase()}`
                      : user?.uid
                        ? `PUT-${user.uid.substring(0, 6).toUpperCase()}`
                        : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="p-1.5 sm:p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <button
                onClick={() => openProfileTab("overview")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <LayoutGrid
                  className="w-5 h-5 text-emerald-400"
                  strokeWidth={2}
                />
                <span className="font-bold">নাগরিক ড্যাশবোর্ড</span>
              </button>
              <button
                onClick={() => openProfileTab("profile")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <User className="w-5 h-5 text-blue-400" strokeWidth={2} />
                <span className="font-bold">আমার প্রোফাইল</span>
              </button>
              <button
                onClick={() => openProfileTab("add_school")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <School className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                <span className="font-bold">শিক্ষা প্রতিষ্ঠান এড করুন</span>
              </button>
              <button
                onClick={() => openProfileTab("rewards")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Smartphone className="w-5 h-5 text-pink-400" strokeWidth={2} />
                <span className="font-bold">রিচার্জ উপহার</span>
              </button>
              <button
                onClick={() => openProfileTab("badges")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Award className="w-5 h-5 text-yellow-400" strokeWidth={2} />
                <span className="font-bold">র‍্যাংকিং ও ব্যাজ</span>
              </button>
              <button
                onClick={() => openProfileTab("services")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <UsersRound className="w-5 h-5 text-red-400" strokeWidth={2} />
                <span className="font-bold">নাগরিক সেবা</span>
              </button>
              <button
                onClick={() => openProfileTab("my_ads")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Store className="w-5 h-5 text-teal-400" strokeWidth={2} />
                <span className="font-bold">আমার ব্যবসা ও বিজ্ঞাপন</span>
              </button>
              <button
                onClick={() => openProfileTab("news_post")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Newspaper
                  className="w-5 h-5 text-indigo-400"
                  strokeWidth={2}
                />
                <span className="font-bold">স্থানীয় সংবাদ পোস্ট</span>
              </button>
              <button
                onClick={() => openProfileTab("social_organizations")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Users className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                <span className="font-bold">সামাজিক প্রতিষ্ঠান</span>
              </button>
              <button
                onClick={() => openProfileTab("blood_donor_network")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Droplet className="w-5 h-5 text-red-500" strokeWidth={2} />
                <span className="font-bold">রক্তদাতা নেটওয়ার্ক</span>
              </button>
              <button
                onClick={() => openProfileTab("agriculture_farm")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Sprout className="w-5 h-5 text-green-400" strokeWidth={2} />
                <span className="font-bold">কৃষি খামার</span>
              </button>
              <button
                onClick={() => openProfileTab("service_providers")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Hammer className="w-5 h-5 text-emerald-500" strokeWidth={2} />
                <span className="font-bold">সেবা প্রদানকারী</span>
              </button>
              <button
                onClick={() => openProfileTab("transport_info")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Bus className="w-5 h-5 text-sky-400" strokeWidth={2} />
                <span className="font-bold">পরিবহন তথ্য</span>
              </button>
              <button
                onClick={() => openProfileTab("career_education")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Briefcase
                  className="w-5 h-5 text-indigo-400"
                  strokeWidth={2}
                />
                <span className="font-bold">ক্যারিয়ার ও শিক্ষা</span>
              </button>
              <button
                onClick={() => openProfileTab("healthcare_medical")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <HeartPulse className="w-5 h-5 text-rose-500" strokeWidth={2} />
                <span className="font-bold">স্বাস্থ্যসেবা ও চিকিৎসা</span>
              </button>
              <button
                onClick={() => openProfileTab("emergency_services")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Flame className="w-5 h-5 text-orange-500" strokeWidth={2} />
                <span className="font-bold">জরুরি সেবা</span>
              </button>
              <button
                onClick={() => openProfileTab("ngo")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Building className="w-5 h-5 text-teal-400" strokeWidth={2} />
                <span className="font-bold">এনজিও ও সামাজিক উন্নয়ন</span>
              </button>
              <button
                onClick={() => openProfileTab("banking_finance")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <CreditCard className="w-5 h-5 text-blue-400" strokeWidth={2} />
                <span className="font-bold">ব্যাংক ও আর্থিক সেবা</span>
              </button>
              <button
                onClick={() => openProfileTab("business_market")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition"
              >
                <ShoppingCart
                  className="w-5 h-5 text-yellow-400"
                  strokeWidth={2}
                />
                <span className="font-bold">ব্যবসা ও বাজার</span>
              </button>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition font-bold"
              >
                <LogOut className="w-5 h-5" />
                লগ আউট করুন
              </button>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 text-white/60 text-xs space-y-2">
              <p>© ২০২৬ {settings.appName} | সর্বস্বত্ব সংরক্ষিত</p>
              <p>contact@ourputhia.com</p>
            </div>
          </div>
        </div>
      )}

      {/* Tools Modal (প্রয়োজনীয় টুলস) */}
      {isToolsMenuOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setIsToolsMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="bg-white rounded-[24px] w-full max-w-[380px] relative shadow-2xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2 pb-3 border-b border-gray-100">
              <h4 className="font-bold text-gray-900 text-[18px]">আরও সেবা</h4>
              <button
                onClick={() => setIsToolsMenuOpen(false)}
                className="p-1.5 bg-gray-100 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto no-scrollbar pb-2">
              {activeSubMenu === "download_center" ? (
                <div>
                  <div className="flex items-center mb-4 border-b border-gray-100 pb-3">
                    <button
                      onClick={() => setActiveSubMenu(null)}
                      className="flex items-center gap-1 text-sm font-bold text-[#125836] hover:opacity-80"
                    >
                      <ChevronDown className="w-5 h-5 rotate-90" /> ফিরে যান
                    </button>
                    <h4 className="font-bold text-gray-900 text-[16px] ml-4">
                      ডাউনলোড সেন্টার
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        id: "application_form",
                        title: "আবেদন ফরম",
                        icon: (
                          <FileText
                            className="w-5 h-5 text-[#125836]"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "important_pdf",
                        title: "গুরুত্বপূর্ণ PDF",
                        icon: (
                          <FileText
                            className="w-5 h-5 text-[#125836]"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "certificate_sample",
                        title: "নাগরিক সনদ নমুনা",
                        icon: (
                          <FileText
                            className="w-5 h-5 text-[#125836]"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "agriculture_guide",
                        title: "কৃষি গাইড",
                        icon: (
                          <BookOpen
                            className="w-5 h-5 text-[#125836]"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "education_material",
                        title: "শিক্ষা উপকরণ",
                        icon: (
                          <Book
                            className="w-5 h-5 text-[#125836]"
                            strokeWidth={2}
                          />
                        ),
                      },
                    ].map((item, idx) => (
                      <button
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-white rounded-3xl shadow-sm border border-gray-100 hover:bg-emerald-50 active:bg-emerald-100 transition-all text-left w-full"
                        onClick={() => {
                          setActiveTab("assistant");
                          setSelectedSubView(item.id);
                          setIsToolsMenuOpen(false);
                          setActiveSubMenu(null);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2.5 rounded-2xl">
                            {item.icon}
                          </div>
                          <span className="font-bold text-gray-800 text-[15px]">
                            {item.title}
                          </span>
                        </div>
                        <span className="text-gray-500 font-bold text-lg">
                          &gt;
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeSubMenu === "complaints_suggestions" ? (
                <div>
                  <div className="flex items-center mb-4 border-b border-gray-100 pb-3">
                    <button
                      onClick={() => setActiveSubMenu(null)}
                      className="flex items-center gap-1 text-sm font-bold text-[#125836] hover:opacity-80"
                    >
                      <ChevronDown className="w-5 h-5 rotate-90" /> ফিরে যান
                    </button>
                    <h4 className="font-bold text-gray-900 text-[16px] ml-4">
                      অভিযোগ ও পরামর্শ
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        id: "problem_report",
                        title: "সমস্যা রিপোর্ট",
                        subtitle: "যেকোনো নাগরিক সমস্যা দ্রুত জানান",
                        icon: (
                          <AlertCircle
                            className="w-5 h-5 text-[#125836]"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "citizen_complaint",
                        title: "নাগরিক অভিযোগ",
                        subtitle: "পরিষেবা বা সুবিধা সংক্রান্ত অভিযোগ",
                        icon: (
                          <MessageSquare
                            className="w-5 h-5 text-[#125836]"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "road_problem",
                        title: "রাস্তা সমস্যা",
                        subtitle: "ভাঙা রাস্তা বা মেরামত সংক্রান্ত",
                        icon: (
                          <MapPin
                            className="w-5 h-5 text-[#125836]"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "electricity_problem",
                        title: "বিদ্যুৎ সমস্যা",
                        subtitle: "লোডশেডিং বা লাইন সংক্রান্ত",
                        icon: (
                          <Zap
                            className="w-5 h-5 text-[#125836]"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "water_problem",
                        title: "পানি সমস্যা",
                        subtitle: "ওয়াসা বা সুপেয় পানির সংকট",
                        icon: (
                          <Droplet
                            className="w-5 h-5 text-[#125836]"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "provide_feedback",
                        title: "মতামত প্রদান",
                        subtitle: "অ্যাপ বা উপজেলা নিয়ে আপনার আইডিয়া",
                        icon: (
                          <Edit
                            className="w-5 h-5 text-[#125836]"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "complaint_status",
                        title: "অভিযোগের অবস্থা",
                        subtitle: "আপনার অভিযোগের বর্তমান স্ট্যাটাস চেক",
                        icon: (
                          <Search
                            className="w-5 h-5 text-[#125836]"
                            strokeWidth={2}
                          />
                        ),
                      },
                    ].map((item, idx) => (
                      <button
                        key={item.id}
                        className="flex flex-col p-4 bg-white rounded-3xl shadow-sm border border-gray-100 hover:bg-emerald-50 active:bg-emerald-100 transition-all text-left w-full"
                        onClick={() => {
                          setActiveTab("assistant");
                          setSelectedSubView(item.id);
                          setIsToolsMenuOpen(false);
                          setActiveSubMenu(null);
                        }}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2.5 rounded-2xl">
                              {item.icon}
                            </div>
                            <span className="font-bold text-gray-800 text-[15px]">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-gray-500 font-bold text-lg">
                            &gt;
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-500 pl-14">
                          {item.subtitle}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeSubMenu === "exclusive_features" ? (
                <div>
                  <div className="flex items-center mb-4 border-b border-gray-100 pb-3">
                    <button
                      onClick={() => setActiveSubMenu(null)}
                      className="flex items-center gap-1 text-sm font-bold text-[#125836] hover:opacity-80 cursor-pointer"
                    >
                      <ChevronDown className="w-5 h-5 rotate-90" /> ফিরে যান
                    </button>
                    <h4 className="font-bold text-gray-900 text-[16px] ml-4">
                      এক্সক্লুসিভ ফিচার
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        id: "digital_id_card",
                        title: "ডিজিটাল পরিচিতি কার্ড",
                        subtitle: "ডিজিটাল আইডি ও নাগরিক তথ্য",
                        icon: (
                          <User
                            className="w-5 h-5 text-indigo-600"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "local_vote_survey",
                        title: "স্থানীয় ভোট/জরিপ",
                        subtitle: "জনগুরুত্বপূর্ণ বিষয়ে মতামত দিন",
                        icon: (
                          <FileText
                            className="w-5 h-5 text-emerald-600"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "citizen_ranking",
                        title: "নাগরিক র্যাংকিং",
                        subtitle: "অবদানের ভিত্তিতে সেরা নাগরিকগণ",
                        icon: (
                          <Trophy
                            className="w-5 h-5 text-yellow-600"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "verified_business",
                        title: "ভেরিফাইড ব্যবসা",
                        subtitle: "যাচাইকৃত স্থানীয় ব্যবসা",
                        icon: (
                          <CheckCircle
                            className="w-5 h-5 text-teal-600"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "community_badge",
                        title: "কমিউনিটি ব্যাজ",
                        subtitle: "নাগরিক সম্মাননা ও ব্যাজ",
                        icon: (
                          <Award
                            className="w-5 h-5 text-amber-500"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "upazila_quiz",
                        title: "উপজেলা কুইজ ও প্রতিযোগিতা",
                        subtitle: "কুইজে অংশ নিয়ে পুরস্কার জিতুন",
                        icon: (
                          <Trophy
                            className="w-5 h-5 text-rose-500"
                            strokeWidth={2}
                          />
                        ),
                      },
                      {
                        id: "local_ads",
                        title: "স্থানীয় স্পন্সর ও বিজ্ঞাপন",
                        subtitle: "ব্যবসার প্রচার ও বিজ্ঞাপন দিন",
                        icon: (
                          <Megaphone
                            className="w-5 h-5 text-blue-600"
                            strokeWidth={2}
                          />
                        ),
                      },
                    ].map((item, idx) => (
                      <button
                        key={item.id}
                        className="flex flex-col p-4 bg-white rounded-3xl shadow-sm border border-gray-100 hover:bg-emerald-50 active:bg-emerald-100 transition-all text-left w-full cursor-pointer"
                        onClick={() => {
                          handleSubSelect(item.id);
                          setIsToolsMenuOpen(false);
                          setActiveSubMenu(null);
                        }}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2.5 rounded-2xl">
                              {item.icon}
                            </div>
                            <span className="font-bold text-gray-800 text-[15px]">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-gray-500 font-bold text-lg">
                            &gt;
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-500 pl-14">
                          {item.subtitle}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                toolsMenu.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={item.action}
                    className="flex items-center justify-between p-4 hover:bg-emerald-50 active:bg-emerald-100 rounded-2xl transition-all text-left group w-full"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center shrink-0`}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-[15px] text-[#1f2937] leading-tight mb-0.5 flex items-center gap-2">
                          {item.title === "গুগল প্লে অ্যাপ"
                            ? "মোবাইল অ্যাপ"
                            : item.title}
                          {item.title === "গুগল প্লে অ্যাপ" && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                              শীঘ্রই আসছে
                            </span>
                          )}
                        </h4>
                        <p className="text-[12px] text-gray-500 leading-tight">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-500 font-bold text-lg">
                      &gt;
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {isSearchOverlayOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-white text-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header of Search Overlay */}
            <div className="bg-[#006a4e] text-white p-4 sm:p-6 shadow-lg flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSearchOverlayOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-6 h-6" />
              </button>

              <form
                onSubmit={(e) => {
                  handleSubmit(e);
                  setIsSearchOverlayOpen(false);
                }}
                className="flex-1 relative"
              >
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="পুরো পুঠিয়া একসাথে খুঁজুন... (মানুষ, হাসপাতাল, বাজার)"
                  value={searchVal || ""}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 bg-white text-slate-900 border-none rounded-2xl outline-none placeholder-slate-400 focus:ring-4 focus:ring-emerald-300/50 transition-all font-sans text-sm sm:text-base font-bold shadow-md"
                />
                {searchVal && (
                  <button
                    type="button"
                    onClick={() => setSearchVal("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Voice Search Button */}
              <VoiceSearch 
                buttonText="ভয়েস"
                onResult={(text) => {
                  onVoiceResult(text);
                  setIsSearchOverlayOpen(false);
                }} 
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-50">
              
              {/* Voice Search Banner Promo */}
              <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white p-5 rounded-3xl shadow-md flex items-center justify-between gap-4 border border-emerald-700/50">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider inline-block">
                    🎙️ বাংলা ভয়েস সার্চ অ্যাসিস্ট্যান্ট
                  </span>
                  <h3 className="text-sm sm:text-base font-black">টাইপ না করে মুখে বলেই খুঁজুন!</h3>
                  <p className="text-xs text-emerald-100/90 font-medium">উদাহরণ: “পুঠিয়ায় ভালো রেস্টুরেন্ট কোথায়?” অথবা “জরুরি ডাক্তার”</p>
                </div>
                <VoiceSearch 
                  buttonText="এখনই বলুন 🎙️"
                  onResult={(text) => {
                    onVoiceResult(text);
                    setIsSearchOverlayOpen(false);
                  }}
                />
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={14} className="text-emerald-700" /> সাম্প্রতিক সার্চ (Recent Searches)
                    </span>
                    <button
                      type="button"
                      onClick={() => setRecentSearches([])}
                      className="text-xs font-black text-rose-600 hover:underline cursor-pointer"
                    >
                      মুছে ফেলুন
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSearchVal(term);
                          onSearch(term);
                          setIsSearchOverlayOpen(false);
                        }}
                        className="px-4 py-2 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 rounded-2xl text-xs font-extrabold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
                      >
                        <Clock size={12} className="text-slate-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  🔥 জনপ্রিয় সার্চ (Popular Searches)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "উপজেলা চেয়ারম্যান", cat: "প্রশাসন" },
                    { label: "পুঠিয়া হাসপাতাল", cat: "স্বাস্থ্য" },
                    { label: "জরুরি রক্তদান", cat: "সেবা" },
                    { label: "বানেশ্বর বাজার দর", cat: "কৃষি" },
                    { label: "ট্রেন সময়সূচী", cat: "পরিবহন" },
                    { label: "পৌরসভা মেয়র", cat: "পৌরসভা" },
                    { label: "কৃষি কর্মকর্তা", cat: "অফিস" },
                    { label: "ফায়ার সার্ভিস", cat: "জরুরি" }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchVal(item.label);
                        onSearch(item.label);
                        setIsSearchOverlayOpen(false);
                      }}
                      className="p-3 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-2xl text-left transition-all shadow-2xs cursor-pointer group"
                    >
                      <h4 className="text-xs font-black text-slate-800 group-hover:text-emerald-800">{item.label}</h4>
                      <span className="text-[10px] font-bold text-emerald-600 mt-0.5 inline-block">খুঁজুন ›</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tip */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 text-center">
                💡 টিপস: স্পেলিং ভুল হলেও সার্চ ইঞ্জিন তথ্য খুঁজে আনবে।
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
}

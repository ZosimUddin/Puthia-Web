import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { 
  Landmark, 
  ShoppingBag, 
  Church, 
  Wallet, 
  Bus, 
  Briefcase, 
  Sprout, 
  Fish, 
  GraduationCap, 
  HeartPulse, 
  Store, 
  Wrench, 
  Users, 
  Laptop, 
  Calendar, 
  Settings,
  ChevronRight,
  Sparkles,
  Info,
  History,
  Building2,
  MapPin,
  Trees,
  Building,
  Car,
  Bike,
  Smartphone,
  Cpu,
  Armchair,
  Tractor,
  Moon,
  Sun,
  ShieldCheck,
  CreditCard,
  Receipt,
  Train,
  Fuel,
  Cloud,
  Calculator,
  ShieldAlert,
  Egg,
  School,
  BookOpen,
  Library,
  Stethoscope,
  Pill,
  Activity,
  Syringe,
  BedDouble,
  Utensils,
  Percent,
  Star,
  Plus,
  Scale,
  Tv,
  HandHelping,
  HelpCircle,
  MessageSquare,
  Zap,
  Wifi,
  FileText,
  LayoutGrid,
  Mic,
  Award,
  Newspaper,
  Globe,
  PhoneCall,
  Download,
  User,
  Search,
  ArrowRight,
  Clock,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "./SectionHeader";

export interface SubMenuItem {
  name: string;
  icon: React.ReactNode;
  actionPath: string;
  badge?: string;
}

export interface MainMenuCategory {
  id: string;
  label: string;
  tagline: string;
  icon: React.ReactNode;
  headerBg: string;
  accentColor: string;
  badgeBg: string;
  borderColor: string;
  subItems: SubMenuItem[];
}

const MAIN_MENU_CATEGORIES: MainMenuCategory[] = [
  {
    id: "admin",
    label: "উপজেলা প্রশাসন",
    tagline: "অফিস, প্রশাসনিক তথ্য ও কর্মকর্তা ডিরেক্টরি",
    icon: <Landmark className="w-6 h-6" />,
    headerBg: "from-emerald-700 via-emerald-800 to-emerald-900",
    accentColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    subItems: [
      { name: "পরিচিতি", icon: <Info size={15} />, actionPath: "/upazila-intro" },
      { name: "কর্মকর্তা", icon: <Briefcase size={15} />, actionPath: "/officers" },
      { name: "ইতিহাস ও ঐতিহ্য", icon: <History size={15} />, actionPath: "/history" },
      { name: "অফিস", icon: <Building2 size={15} />, actionPath: "/offices" },
      { name: "ইউনিয়ন", icon: <Users size={15} />, actionPath: "/unions" },
      { name: "গুরুত্বপূর্ণ স্থান", icon: <MapPin size={15} />, actionPath: "/important-places" },
    ],
  },
  {
    id: "marketplace",
    label: "পুঠিয়া মার্কেটপ্লেস",
    tagline: "বাসা ভাড়া, দোকান, গাড়ি, জমি ও কেনাবেচা",
    icon: <ShoppingBag className="w-6 h-6" />,
    headerBg: "from-emerald-700 via-emerald-800 to-emerald-900",
    accentColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    subItems: [
      { name: "বাসা", icon: <Building size={15} />, actionPath: "/house-rent", badge: "হট" },
      { name: "জমি কেনাবেচা", icon: <Trees size={15} />, actionPath: "/land-sale" },
      { name: "ফ্ল্যাট", icon: <Building2 size={15} />, actionPath: "p/flat-sale" },
      { name: "দোকান ভাড়া", icon: <Store size={15} />, actionPath: "p/shop" },
      { name: "অফিস স্পেস", icon: <Building size={15} />, actionPath: "p/office" },
      { name: "গাড়ি বিক্রি", icon: <Car size={15} />, actionPath: "p/car" },
      { name: "মোটরসাইকেল", icon: <Bike size={15} />, actionPath: "p/motorcycle" },
      { name: "মোবাইল শপ", icon: <Smartphone size={15} />, actionPath: "p/mobile" },
      { name: "ইলেকট্রনিক্স", icon: <Cpu size={15} />, actionPath: "p/electronics" },
      { name: "আসবাবপত্র", icon: <Armchair size={15} />, actionPath: "p/furniture" },
      { name: "গবাদি পশু", icon: <Sprout size={15} />, actionPath: "p/cattle-livestock" },
      { name: "কৃষি পণ্য", icon: <Tractor size={15} />, actionPath: "p/agriculture-products" },
      { name: "স্থানীয় সেবা", icon: <Wrench size={15} />, actionPath: "/local-services" },
    ],
  },
  {
    id: "religious",
    label: "ধর্মীয় প্রতিষ্ঠান",
    tagline: "উপজেলার সকল মসজিদ, মন্দির, ঈদগাহ ও কবরস্থান",
    icon: <Church className="w-6 h-6" />,
    headerBg: "from-emerald-700 via-emerald-800 to-emerald-900",
    accentColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    subItems: [
      { name: "মসজিদ", icon: <Moon size={15} />, actionPath: "p/mosque" },
      { name: "ঈদগাহ মাঠ", icon: <Sun size={15} />, actionPath: "p/eidgah" },
      { name: "কবরস্থান", icon: <Trees size={15} />, actionPath: "p/graveyard" },
      { name: "মন্দির", icon: <Landmark size={15} />, actionPath: "p/temple" },
      { name: "সকল প্রতিষ্ঠান", icon: <Landmark size={15} />, actionPath: "p/religious" },
    ],
  },
  {
    id: "banking",
    label: "ব্যাংকিং ও ফিন্যান্স",
    tagline: "ব্যাংক, এটিএম, মোবাইল ব্যাংকিং ও ডিরেক্টরি",
    icon: <Wallet className="w-6 h-6" />,
    headerBg: "from-emerald-700 via-emerald-800 to-emerald-900",
    accentColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    subItems: [
      { name: "সকল ব্যাংক", icon: <Building size={15} />, actionPath: "/finance/bank" },
      { name: "মোবাইল ব্যাংকিং", icon: <Smartphone size={15} />, actionPath: "p/services" },
      { name: "বীমা সেবা", icon: <ShieldCheck size={15} />, actionPath: "p/insurance" },
      { name: "ডিজিটাল পেমেন্ট", icon: <CreditCard size={15} />, actionPath: "p/finance" },
      { name: "এটিএম বুথ", icon: <Receipt size={15} />, actionPath: "p/services" },
      { name: "আর্থিক সেবা", icon: <Wallet size={15} />, actionPath: "p/finance" },
    ],
  },
  {
    id: "transport",
    label: "পরিবহন ব্যবস্থা",
    tagline: "বাস, ট্রেন, সিএনজি, অটো ও লোকাল গাড়ি গাইড",
    icon: <Bus className="w-6 h-6" />,
    headerBg: "from-emerald-700 via-emerald-800 to-emerald-900",
    accentColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    subItems: [
      { name: "বাসের সময়সূচি", icon: <Bus size={15} />, actionPath: "/transport?tab=bus_schedule" },
      { name: "ট্রেনের সময়সূচি", icon: <Train size={15} />, actionPath: "/transport?tab=train_schedule" },
      { name: "সিএনজি ও অটো", icon: <Car size={15} />, actionPath: "/transport?tab=cng_auto" },
      { name: "লোকাল পরিবহন", icon: <Bus size={15} />, actionPath: "/transport?tab=local_transport" },
      { name: "রাইড শেয়ার", icon: <Bike size={15} />, actionPath: "/transport?tab=bike_share" },
      { name: "পেট্রোল পাম্প", icon: <Fuel size={15} />, actionPath: "/transport?tab=petrol_pump" },
    ],
  },
  {
    id: "jobs",
    label: "চাকরি ও ক্যারিয়ার",
    tagline: "সরকারি, বেসরকারি নিয়োগ ও ফ্রিল্যান্সিং খবর",
    icon: <Briefcase className="w-6 h-6" />,
    headerBg: "from-emerald-700 via-emerald-800 to-emerald-900",
    accentColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    subItems: [
      { name: "সরকারি চাকরি", icon: <Landmark size={15} />, actionPath: "p/govt-jobs", badge: "নতুন" },
      { name: "বেসরকারি চাকরি", icon: <Building2 size={15} />, actionPath: "p/private-jobs" },
      { name: "নিয়োগ বিজ্ঞপ্তি", icon: <FileText size={15} />, actionPath: "p/local-jobs" },
      { name: "ফ্রিল্যান্সিং", icon: <Laptop size={15} />, actionPath: "p/freelancing" },
    ],
  },


  {
    id: "education",
    label: "শিক্ষা প্রতিষ্ঠান",
    tagline: "স্কুল, কলেজ, মাদ্রাসা, কোচিং ও লাইব্রেরি",
    icon: <GraduationCap className="w-6 h-6" />,
    headerBg: "from-emerald-700 via-emerald-800 to-emerald-900",
    accentColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    subItems: [
      { name: "স্কুল", icon: <School size={15} />, actionPath: "p/school" },
      { name: "কলেজ", icon: <Building2 size={15} />, actionPath: "p/college" },
      { name: "মাদ্রাসা", icon: <Landmark size={15} />, actionPath: "p/madrasha" },
      { name: "কোচিং সেন্টার", icon: <BookOpen size={15} />, actionPath: "/coaching" },
      { name: "লাইব্রেরি", icon: <Library size={15} />, actionPath: "/libraries" },
      { name: "কারিগরি", icon: <Wrench size={15} />, actionPath: "p/vocational" },
    ],
  },
  {
    id: "health",
    label: "স্বাস্থ্য ও চিকিৎসা",
    tagline: "হাসপাতাল, ডাক্তার, ক্লিনিক, ডায়াগনস্টিক ও অ্যাম্বুলেন্স",
    icon: <HeartPulse className="w-6 h-6" />,
    headerBg: "from-emerald-700 via-emerald-800 to-emerald-900",
    accentColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    subItems: [
      { name: "হাসপাতাল", icon: <Building2 size={15} />, actionPath: "p/hospital" },
      { name: "বিশেষজ্ঞ ডাক্তার", icon: <Stethoscope size={15} />, actionPath: "p/doctor" },
      { name: "কমিউনিটি ক্লিনিক", icon: <Building size={15} />, actionPath: "p/community-clinic" },
      { name: "ফার্মেসি", icon: <Pill size={15} />, actionPath: "p/pharmacy" },
      { name: "ডায়াগনস্টিক", icon: <Activity size={15} />, actionPath: "p/diagnostic" },
      { name: "অ্যাম্বুলেন্স", icon: <Bus size={15} />, actionPath: "p/ambulance", badge: "জরুরী" },
      { name: "টিকাদান কেন্দ্র", icon: <Syringe size={15} />, actionPath: "p/vaccination" },
    ],
  },
  {
    id: "trade",
    label: "ব্যবসা ও ডিরেক্টরি",
    tagline: "যাচাইকৃত ব্যবসা, দোকান, হোটেল ও অফার",
    icon: <Store className="w-6 h-6" />,
    headerBg: "from-emerald-700 via-emerald-800 to-emerald-900",
    accentColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    subItems: [
      { name: "ব্যবসা", icon: <Briefcase size={15} />, actionPath: "p/verified-business" },
      { name: "দোকানপাট", icon: <Store size={15} />, actionPath: "p/shop" },
      { name: "সুপার শপ", icon: <ShoppingBag size={15} />, actionPath: "p/supershop" },
      { name: "রেস্টুরেন্ট", icon: <Utensils size={15} />, actionPath: "p/restaurant" },
      { name: "হোটেল ব্যবসা", icon: <BedDouble size={15} />, actionPath: "p/hotel" },
      { name: "উদ্যোক্তা", icon: <Sparkles size={15} />, actionPath: "p/entrepreneur" },
      { name: "বিশেষ অফার", icon: <Percent size={15} />, actionPath: "p/special-offers" },
      { name: "রিভিউ ও রেটিং", icon: <Star size={15} />, actionPath: "/reviews" },
      { name: "ব্যবসা যুক্ত করুন", icon: <Plus size={15} />, actionPath: "p/add-business", badge: "ফ্রি" },
    ],
  },
  {
    id: "local_services",
    label: "স্থানীয় সেবা ও কারিগর",
    tagline: "ইলেকট্রিশিয়ান, মেকানিক, আইনজীবী ও মিস্ত্রি",
    icon: <Wrench className="w-6 h-6" />,
    headerBg: "from-emerald-700 via-emerald-800 to-emerald-900",
    accentColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    subItems: [
      { name: "সকল কারিগর", icon: <Wrench size={15} />, actionPath: "/local-services" },
      { name: "আইনজীবী", icon: <Scale size={15} />, actionPath: "/lawyers" },
      { name: "ফ্রিজ টেকনিশিয়ান", icon: <Wrench size={15} />, actionPath: "/local-services?category=fridge" },
      { name: "ডিশ ও ক্যাবল", icon: <Tv size={15} />, actionPath: "/local-services?category=dish" },
      { name: "কম্পিউটার ও মোবাইল", icon: <Smartphone size={15} />, actionPath: "/local-services?category=computer" },
      { name: "ইলেকট্রিশিয়ান", icon: <Wrench size={15} />, actionPath: "/local-services?category=electrician" },
      { name: "মিস্ত্রি সেবা", icon: <Wrench size={15} />, actionPath: "/local-services?category=mason" },
      { name: "দর্জি সেবা", icon: <Briefcase size={15} />, actionPath: "/local-services?category=tailor" },
    ],
  },
  {
    id: "social_community",
    label: "সমাজ ও কমিউনিটি",
    tagline: "এনজিও, এতিমখানা, স্বেচ্ছাসেবক ও ফোরাম",
    icon: <Users className="w-6 h-6" />,
    headerBg: "from-emerald-700 via-emerald-800 to-emerald-900",
    accentColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    subItems: [
      { name: "এনজিও সংস্থা", icon: <HandHelping size={15} />, actionPath: "/ngo" },
      { name: "এতিমখানা", icon: <Users size={15} />, actionPath: "p/orphanage" },
      { name: "জাকাত সাহায্য", icon: <HandHelping size={15} />, actionPath: "p/zakat" },
      { name: "স্বেচ্ছাসেবক টিম", icon: <HandHelping size={15} />, actionPath: "/volunteer" },
    ],
  },
  {
    id: "tech_utility",
    label: "প্রযুক্তি ও পরিষেবা",
    tagline: "আইটি সেন্টার, কম্পিউটার ট্রেনিং ও ব্রডব্যান্ড",
    icon: <Laptop className="w-6 h-6" />,
    headerBg: "from-emerald-700 via-emerald-800 to-emerald-900",
    accentColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    subItems: [
      { name: "আইটি সেন্টার", icon: <Laptop size={15} />, actionPath: "/it-centers" },
      { name: "কম্পিউটার প্রশিক্ষণ", icon: <BookOpen size={15} />, actionPath: "/computer-training" },
      { name: "ডিজিটাল সেবা", icon: <Smartphone size={15} />, actionPath: "/digital-services" },
      { name: "ইন্টারনেট সেবা", icon: <Wifi size={15} />, actionPath: "/internet-service" },
      { name: "অন্যান্য সেবা", icon: <Settings size={15} />, actionPath: "/digital-services" },
    ],
  },
  {
    id: "events",
    label: "সংবাদ ও ইভেন্ট",
    tagline: "সর্বশেষ খবর, নোটিশ, গ্যালারি ও মেলা আপডেট",
    icon: <Calendar className="w-6 h-6" />,
    headerBg: "from-emerald-700 via-emerald-800 to-emerald-900",
    accentColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    subItems: [
      { name: "সংবাদ", icon: <FileText size={15} />, actionPath: "/news" },
      { name: "নোটিশ", icon: <Info size={15} />, actionPath: "/notice" },
      { name: "ছবি গ্যালারি", icon: <LayoutGrid size={15} />, actionPath: "/photo-gallery" },
      { name: "ভিডিও গ্যালারি", icon: <LayoutGrid size={15} />, actionPath: "/video-gallery" },
      { name: "মেলা ও উৎসব", icon: <Store size={15} />, actionPath: "/mela" },
      { name: "খেলাধুলা", icon: <Award size={15} />, actionPath: "/sports" },
      { name: "সাংস্কৃতিক ইভেন্ট", icon: <Mic size={15} />, actionPath: "/cultural-events" },
      { name: "সাংবাদিকবৃন্দ", icon: <Newspaper size={15} />, actionPath: "/journalists" },
      { name: "নিউজ পোর্টাল", icon: <Globe size={15} />, actionPath: "/news-portals" },
    ],
  },
];

interface PopularCategoriesSectionProps {
  onSeeAllClick?: () => void;
}

const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((char) => {
      const digit = parseInt(char);
      return isNaN(digit) ? char : bengaliDigits[digit];
    })
    .join("");
};

const PopularCategoriesSection: React.FC<PopularCategoriesSectionProps> = ({ onSeeAllClick }) => {
  const navigate = useNavigate();
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MainMenuCategory | null>(null);

  const handleCardClick = (e: React.MouseEvent<HTMLElement>, category: MainMenuCategory) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add soft ripple effect
    const rippleEl = document.createElement("span");
    rippleEl.className = "absolute rounded-full bg-emerald-400/25 animate-ping pointer-events-none z-20";
    rippleEl.style.width = "140px";
    rippleEl.style.height = "140px";
    rippleEl.style.left = `${x - 70}px`;
    rippleEl.style.top = `${y - 70}px`;
    e.currentTarget.appendChild(rippleEl);
    setTimeout(() => rippleEl.remove(), 600);

    setSelectedCategory(category);
  };

  // Firestore collections states
  const [educationalInstitutions, setEducationalInstitutions] = useState<any[]>([]);
  const [institutionsList, setInstitutionsList] = useState<any[]>([]);
  const [jobNews, setJobNews] = useState<any[]>([]);
  const [localJobs, setLocalJobs] = useState<any[]>([]);
  const [toletAds, setToletAds] = useState<any[]>([]);
  const [landSales, setLandSales] = useState<any[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);
  const [touristSpots, setTouristSpots] = useState<any[]>([]);
  const [healthServices, setHealthServices] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [mosquePosts, setMosquePosts] = useState<any[]>([]);
  const [serviceProviderPosts, setServiceProviderPosts] = useState<any[]>([]);
  const [lostFound, setLostFound] = useState<any[]>([]);

  // Setup real-time listeners on mount
  useEffect(() => {
    const unsubscribes = [
      onSnapshot(collection(db, "educational_institutions"), (snapshot) => {
        setEducationalInstitutions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.warn(err)),
      onSnapshot(collection(db, "institutions_list"), (snapshot) => {
        setInstitutionsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.warn(err)),
      onSnapshot(collection(db, "job_news"), (snapshot) => {
        setJobNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.warn(err)),
      onSnapshot(collection(db, "local_jobs"), (snapshot) => {
        setLocalJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.warn(err)),
      onSnapshot(collection(db, "tolet_ads"), (snapshot) => {
        setToletAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.warn(err)),
      onSnapshot(collection(db, "land_sales"), (snapshot) => {
        setLandSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.warn(err)),
      onSnapshot(collection(db, "marketplace_items"), (snapshot) => {
        setMarketplaceItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.warn(err)),
      onSnapshot(collection(db, "tourist_spots"), (snapshot) => {
        setTouristSpots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.warn(err)),
      onSnapshot(collection(db, "health_services"), (snapshot) => {
        setHealthServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.warn(err)),
      onSnapshot(collection(db, "businesses"), (snapshot) => {
        setBusinesses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.warn(err)),
      onSnapshot(collection(db, "mosque_posts"), (snapshot) => {
        setMosquePosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.warn(err)),
      onSnapshot(collection(db, "service_provider_posts"), (snapshot) => {
        setServiceProviderPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.warn(err)),
      onSnapshot(collection(db, "lost_found"), (snapshot) => {
        setLostFound(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.warn(err))
    ];

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  // Compute dynamic counts in Bengali matching category items
  const getCategoryItemCountText = (catId: string, subName: string): string | null => {
    if (catId === "education") {
      if (subName === "স্কুল") {
        const eduSchools = educationalInstitutions.filter(inst => inst.category === "school" || inst.category === "school").length;
        const listSchools = institutionsList.filter(inst => inst.type === "primary" || inst.type === "secondary").length;
        return `${toBengaliNumber(eduSchools + listSchools)}টি`;
      }
      if (subName === "কলেজ") {
        const eduColleges = educationalInstitutions.filter(inst => inst.category === "college").length;
        const listColleges = institutionsList.filter(inst => inst.type === "college").length;
        return `${toBengaliNumber(eduColleges + listColleges)}টি`;
      }
      if (subName === "মাদ্রাসা") {
        const eduMadrasas = educationalInstitutions.filter(inst => inst.category === "madrasa").length;
        const listMadrasas = institutionsList.filter(inst => inst.type === "madrasa").length;
        return `${toBengaliNumber(eduMadrasas + listMadrasas)}টি`;
      }
      if (subName === "কোচিং সেন্টার") {
        const coachingCount = educationalInstitutions.filter(inst => inst.category === "coaching").length;
        return `${toBengaliNumber(coachingCount)}টি`;
      }
      if (subName === "লাইব্রেরি") {
        const libraryCount = educationalInstitutions.filter(inst => inst.category === "library").length;
        return `${toBengaliNumber(libraryCount)}টি`;
      }
      if (subName === "কারিগরি") {
        const vocationalCount = educationalInstitutions.filter(inst => inst.category === "vocational" || inst.category === "technical").length + 
                               institutionsList.filter(inst => inst.type === "technical").length;
        return `${toBengaliNumber(vocationalCount)}টি`;
      }
    }

    if (catId === "health") {
      if (subName === "হাসপাতাল") {
        const hospitalCount = healthServices.filter(h => h.type === "সরকারি হাসপাতাল" || h.type === "বেসরকারি হাসপাতাল" || h.type === "প্রাইভেট ক্লিনিক" || h.category === "hospital").length;
        return `${toBengaliNumber(hospitalCount)}টি`;
      }
      if (subName === "विशेषज्ञ ডাক্তার" || subName === "বিশেষজ্ঞ ডাক্তার") {
        const doctorCount = healthServices.filter(h => h.type === "ডাক্তার" || h.type === "विशेषज्ञ ডাক্তার" || h.type === "বিশেষজ্ঞ ডাক্তার" || h.type?.includes("ডাক্তার") || h.category === "doctor").length;
        return `${toBengaliNumber(doctorCount)}জন`;
      }
      if (subName === "কমিউনিটি ক্লিনিক") {
        const clinicCount = healthServices.filter(h => h.type === "কমিউনিটি ক্লিনিক" || h.category === "community-clinic").length;
        return `${toBengaliNumber(clinicCount)}টি`;
      }
      if (subName === "ফার্মেসি") {
        const pharmacyCount = healthServices.filter(h => h.type === "ফার্মেসি" || h.type === "ঔষধের দোকান" || h.category === "pharmacy").length;
        return `${toBengaliNumber(pharmacyCount)}টি`;
      }
      if (subName === "ডায়াগনস্টিক") {
        const diagnosticCount = healthServices.filter(h => h.type === "ডায়াগনস্টিক" || h.type === "ডায়াগনস্টিক সেন্টার" || h.type === "ডায়াগনস্টিক সেন্টার" || h.category === "diagnostic").length;
        return `${toBengaliNumber(diagnosticCount)}টি`;
      }
      if (subName === "অ্যাম্বুলেন্স") {
        const ambulanceCount = healthServices.filter(h => h.type === "অ্যাম্বুলেন্স" || h.category === "ambulance").length;
        return `${toBengaliNumber(ambulanceCount)}টি`;
      }
      if (subName === "টিকাদান কেন্দ্র") {
        const vaccinationCount = healthServices.filter(h => h.type === "টিকাদান কেন্দ্র" || h.category === "vaccination").length;
        return `${toBengaliNumber(vaccinationCount)}টি`;
      }
    }

    if (catId === "jobs") {
      if (subName === "सरकारी नौकरी" || subName === "সরকারি চাকরি") {
        const govCount = jobNews.filter(j => j.category === "gov").length;
        return `${toBengaliNumber(govCount + 3)}টি`;
      }
      if (subName === "বেসরকারি চাকরি") {
        const pvtCount = jobNews.filter(j => j.category === "private").length;
        return `${toBengaliNumber(pvtCount + 3)}টি`;
      }
      if (subName === "নিয়োগ বিজ্ঞপ্তি") {
        const localJobsCount = localJobs.length;
        return `${toBengaliNumber(localJobsCount + 4)}টি`;
      }
      if (subName === "ফ্রিল্যান্সিং") {
        return `${toBengaliNumber(15)}টি`;
      }
    }

    if (catId === "marketplace") {
      if (subName === "বাসা") {
        const houseCount = toletAds.filter(ad => ad.category === "house" || ad.category === "mess" || !ad.category).length;
        return `${toBengaliNumber(houseCount + 5)}টি`;
      }
      if (subName === "দোকান ভাড়া") {
        const shopCount = toletAds.filter(ad => ad.category === "shop").length;
        return `${toBengaliNumber(shopCount + 2)}টি`;
      }
      if (subName === "অফিস স্পেস") {
        const officeCount = toletAds.filter(ad => ad.category === "office").length;
        return `${toBengaliNumber(officeCount + 1)}টি`;
      }
      if (subName === "জমি কেনাবেচা") {
        const landCount = landSales.length;
        return `${toBengaliNumber(landCount + 3)}টি`;
      }
      if (subName === "গাড়ি বিক্রি") {
        const carCount = marketplaceItems.filter(item => item.category === "car" || item.category === "car").length;
        return `${toBengaliNumber(carCount + 1)}টি`;
      }
      if (subName === "মোটরসাইকেল") {
        const motorcycleCount = marketplaceItems.filter(item => item.category === "motorcycle" || item.category === "bike" || item.category === "bicycle").length;
        return `${toBengaliNumber(motorcycleCount + 2)}টি`;
      }
      if (subName === "মোবাইল শপ") {
        const mobileCount = marketplaceItems.filter(item => item.category === "mobile").length;
        return `${toBengaliNumber(mobileCount + 2)}টি`;
      }
      if (subName === "ইলেকট্রনিক্স") {
        const electronicsCount = marketplaceItems.filter(item => item.category === "electronics" || item.category === "laptop").length;
        return `${toBengaliNumber(electronicsCount + 3)}টি`;
      }
      if (subName === "আসবাবপত্র") {
        const furnitureCount = marketplaceItems.filter(item => item.category === "furniture").length;
        return `${toBengaliNumber(furnitureCount + 2)}টি`;
      }
      if (subName === "গবাদি পশু") {
        const livestockCount = marketplaceItems.filter(item => item.category === "livestock" || item.category === "cattle").length;
        return `${toBengaliNumber(livestockCount + 4)}টি`;
      }
      if (subName === "কৃষি পণ্য") {
        const agriCount = marketplaceItems.filter(item => item.category === "agri").length;
        return `${toBengaliNumber(agriCount + 5)}টি`;
      }
    }

    if (catId === "admin") {
      if (subName === "গুরুত্বপূর্ণ স্থান") {
        return `${toBengaliNumber(touristSpots.length + 2)}টি`;
      }
      if (subName === "ইউনিয়ন") {
        return `${toBengaliNumber(6)}টি`;
      }
    }

    if (catId === "religious") {
      if (subName === "মসজিদ") {
        return `${toBengaliNumber(mosquePosts.length + 6)}টি`;
      }
      if (subName === "ঈদগাহ মাঠ") {
        return `${toBengaliNumber(2)}টি`;
      }
      if (subName === "কবরস্থান") {
        return `${toBengaliNumber(3)}টি`;
      }
      if (subName === "মন্দির") {
        return `${toBengaliNumber(4)}টি`;
      }
    }

    if (catId === "banking") {
      if (subName === "সকল ব্যাংক") return `${toBengaliNumber(12)}টি`;
      if (subName === "মোবাইল ব্যাংকিং") return `${toBengaliNumber(8)}টি`;
      if (subName === "এটিএম বুথ") return `${toBengaliNumber(10)}টি`;
    }

    if (catId === "local_services") {
      if (subName === "সকল কারিগর") {
        return `${toBengaliNumber(serviceProviderPosts.length + 12)}জন`;
      }
      if (subName === "আইনজীবী") {
        const lawyerCount = serviceProviderPosts.filter(p => p.category === "lawyer" || p.category === "আইনজীবী").length;
        return `${toBengaliNumber(lawyerCount + 4)}জন`;
      }
    }

    if (catId === "social_community") {
      if (subName === "হারানো ও পাওয়া") {
        return `${toBengaliNumber(lostFound.length + 1)}টি`;
      }
    }

    // Default fallbacks for missing categories
    const defaultCounts: Record<string, string> = {
      // admin
      "পরিচিতি": "১টি",
      "কর্মকর্তা": "৩০জন",
      "ইতিহাস ও ঐতিহ্য": "১টি",
      "অফিস": "১৫টি",
      "ইউনিয়ন": "৬টি",
      
      // marketplace
      "স্থানীয় সেবা": "৮টি",
      
      // banking
      "বীমা সেবা": "৫টি",
      "ডিজিটাল পেমেন্ট": "৪টি",
      "আর্থিক সেবা": "২৫টি",
      
      // jobs
      "পার্ট টাইম জব": "৫টি",
      "অনলাইন কাজ": "৮টি",
      
      // transport
      "বাসের সময়সূচি": "১২টি",
      "ট্রেনের সময়সূচি": "৮টি",
      "সিএনজি ও অটো": "৫টি",
      "লোকাল পরিবহন": "১০টি",
      "রাইড শেয়ার": "১৫টি",
      "পেট্রোল পাম্প": "৪টি",

      // trade
      "ব্যবসা ডিরেক্টরি": "৪৫টি",
      "দোকানপাট": "১২০টি",
      "সুপার শপ": "৩টি",
      "রেস্টুরেন্ট": "১৫টি",
      "হোটেল ও রিসোর্ট": "৪টি",
      "স্থানীয় উদ্যোক্তা": "২০জন",
      "বিশেষ অফার": "৫টি",
      "রিভিউ ও রেটিং": "৫০টি",
      "ব্যবসা যুক্ত করুন": "ফ্রি",

      // local_services
      "সকল কারিগর": "৩৫জন",
      "আইনজীবী": "১২জন",
      "ফ্রিজ টেকনিশিয়ান": "৮জন",
      "ডিশ ও ক্যাবল": "৫টি",
      "কম্পিউটার ও মোবাইল": "১৫টি",
      "ইলেকট্রিশিয়ান": "১০জন",
      "মিস্ত্রি সেবা": "২০জন",
      "দর্জি সেবা": "১২টি",
      
      // social_community
      "এনজিও সংস্থা": "১৫টি",
      "এতিমখানা": "৫টি",
      "জাকাত সাহায্য": "১০টি",
      "স্বেচ্ছাসেবক টিম": "৮টি",
      "হারানো ও পাওয়া": "৩টি",
      "মতামত ও আলোচনা": "২০টি",
      
      // tech_utility
      "আইটি সেন্টার": "৫টি",
      "কম্পিউটার প্রশিক্ষণ": "৪টি",
      "ডিজিটাল সেবা": "১২টি",
      "পল্লী বিদ্যুৎ": "১টি",
      "ইন্টারনেট সেবা": "৬টি",
      "অন্যান্য সেবা": "৮টি",
      
      // events
      "সংবাদ": "২০টি",
      "নোটিশ": "১৫টি",
      "ছবি গ্যালারি": "১২টি",
      "ভিডিও গ্যালারি": "৮টি",
      "মেলা ও উৎসব": "৩টি",
      "খেলাধুলা": "৫টি",
      "সাংস্কৃতিক ইভেন্ট": "৪টি",
      "সাংবাদিকবৃন্দ": "১৫জন",
      "নিউজ পোর্টাল": "৩টি",
      
      // religious
      "সকল প্রতিষ্ঠান": "১৬টি"
    };

    if (defaultCounts[subName]) {
      return defaultCounts[subName];
    }
    
    // Generic Catch-all
    return `${toBengaliNumber(5)}টি`;
  };

  // Compute total entries/information count for a main menu category (e.g. "২৫৬টি তথ্য")
  const getCategoryTotalInfoCount = (category: MainMenuCategory): string => {
    let totalCount = 0;
    category.subItems.forEach((sub) => {
      const text = getCategoryItemCountText(category.id, sub.name);
      if (text) {
        const banglaDigits: Record<string, string> = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };
        let englishNumStr = "";
        for (const char of text) {
          if (banglaDigits[char]) {
            englishNumStr += banglaDigits[char];
          } else if (/[0-9]/.test(char)) {
            englishNumStr += char;
          }
        }
        const num = parseInt(englishNumStr, 10);
        if (!isNaN(num) && num > 0) {
          totalCount += num;
        }
      }
    });

    if (totalCount === 0) {
      const fallbacks: Record<string, number> = {
        admin: 54,
        marketplace: 145,
        religious: 32,
        banking: 65,
        transport: 54,
        jobs: 48,
        education: 112,
        health: 86,
        trade: 262,
        local_services: 118,
        social_community: 62,
        tech_utility: 36,
        events: 96,
      };
      totalCount = fallbacks[category.id] || 50;
    }

    return `${toBengaliNumber(totalCount)}টি তথ্য`;
  };

  const filteredCategories = MAIN_MENU_CATEGORIES.map((category) => {
    if (!filterQuery.trim()) return category;
    const query = filterQuery.toLowerCase();
    const matchCategory = category.label.toLowerCase().includes(query) || category.tagline.toLowerCase().includes(query);
    const matchedSubItems = category.subItems.filter((sub) => sub.name.toLowerCase().includes(query));
    
    if (matchCategory || matchedSubItems.length > 0) {
      return {
        ...category,
        subItems: matchCategory ? category.subItems : matchedSubItems,
      };
    }
    return null;
  }).filter(Boolean) as MainMenuCategory[];

  return (
    <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full my-2 sm:my-4" id="premium-categories-grid">
      {/* Section Header */}
      <div className="flex flex-col items-center justify-center text-center gap-3 mb-6 sm:mb-8 pb-4 border-b border-slate-200/80">
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-2xl text-xs font-bold tracking-wide mb-2 shadow-xs">
            <Sparkles size={14} className="text-emerald-600 animate-pulse" />
            <span>আমাদের পুঠিয়া স্মার্ট মেইন মেনু</span>
          </div>
          <h2 className="text-2xl md:text-8xl font-black text-slate-900 tracking-tight leading-tight">
            প্রধান মেইন মেনু সমূহ
          </h2>
          <p className="text-xs md:text-3xl font-black text-slate-500 mt-2">
            আপনার কাঙ্ক্ষিত সেবা খুঁজে পেতে নিচে যেকোনো বড় মেইন মেনু কার্ডে ক্লিক করুন।
          </p>
        </div>
      </div>

      {/* Grid of Big Main Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch">
        {filteredCategories.map((category, idx) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.35, delay: (idx % 3) * 0.05 }}
            onClick={(e) => handleCardClick(e, category)}
            className="flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 p-5 cursor-pointer group hover:border-emerald-500/80 hover:-translate-y-1 relative overflow-hidden active:scale-[0.99]"
          >
            {/* Background Hover Accent Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/80 rounded-bl-full -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
              {/* Top Row: Big Icon with Soft Gradient & Badges */}
              <div className="flex items-center justify-between gap-2.5">
                {/* Fixed 52x52px Icon Container with 24px Icon */}
                <div className="w-[52px] h-[52px] min-w-[52px] min-h-[52px] rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs border border-emerald-400/20 group-hover:scale-105 transition-transform duration-300 [&>svg]:w-6 [&>svg]:h-6">
                  {category.icon}
                </div>

                <div className="flex items-center justify-end">
                  {/* Fixed Height (h-9) & Padding (px-3.5) Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(e, category);
                    }}
                    className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer shadow-xs group/btn"
                  >
                    <span>আরও দেখুন</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Middle Section: Title & Subtitle */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl md:text-5xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight leading-snug">
                    {category.label}
                  </h3>
                </div>
                <div>
                  {/* Fixed Height (h-6) Service Badge */}
                  <span className="h-6 md:h-12 inline-flex items-center text-xs md:text-2xl font-black text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 md:px-6 rounded-2xl">
                    {toBengaliNumber(category.subItems.length)}টি সেবা
                  </span>
                </div>
                <p className="text-sm md:text-3xl font-bold text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {category.tagline}
                </p>
              </div>

              {/* Bottom Row: Quick Sub-Items Tags */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                {category.subItems.slice(0, 4).map((sub, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(sub.actionPath);
                    }}
                    className="h-7 px-2.5 inline-flex items-center justify-center bg-slate-100/90 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 text-[11px] sm:text-xs font-bold rounded-2xl transition-colors border border-slate-200/60 hover:border-emerald-300 cursor-pointer truncate"
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-[20px] border border-slate-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <p className="text-base font-bold text-slate-600">
            "{filterQuery}" সম্পর্কিত কোন ক্যাটাগরি বা সেবা পাওয়া যায়নি।
          </p>
          <button
            onClick={() => setFilterQuery("")}
            className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            সকল ক্যাটাগরি পুনঃপ্রদর্শন করুন
          </button>
        </div>
      )}

      {/* Sub-Category Detail Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white w-full max-w-2xl rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-[80vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white flex items-center justify-between relative shrink-0">
                <div className="flex items-center gap-3.5 min-w-0 pr-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white border border-emerald-300/30 flex items-center justify-center shrink-0 shadow-md [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-7 sm:[&>svg]:h-7">
                    {selectedCategory.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                      {selectedCategory.label}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100/90 font-medium line-clamp-1 mt-0.5">
                      {selectedCategory.tagline}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCategory(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  aria-label="বন্ধ করুন"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Sub-Items List */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
                    উপলব্ধ সকল সেবা ({toBengaliNumber(selectedCategory.subItems.length)}টি)
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    যেকোনো সেবায় ক্লিক করুন
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {selectedCategory.subItems.map((sub, sIdx) => (
                    <motion.button
                      key={sIdx}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedCategory(null);
                        navigate(sub.actionPath);
                      }}
                      className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/60 hover:shadow-md transition-all duration-200 text-left group/subitem cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.03)]"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-11 h-11 min-w-[44px] rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60 group-hover/subitem:bg-emerald-600 group-hover/subitem:text-white transition-colors [&>svg]:w-5 [&>svg]:h-5">
                          {sub.icon}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-base sm:text-lg font-bold text-slate-900 group-hover/subitem:text-emerald-950 leading-snug truncate">
                            {sub.name}
                          </span>
                          {getCategoryItemCountText(selectedCategory.id, sub.name) && (
                            <span className="text-xs font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {getCategoryItemCountText(selectedCategory.id, sub.name)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pl-2">
                        {sub.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-2xl bg-rose-500 text-white uppercase tracking-wider">
                            {sub.badge}
                          </span>
                        )}
                        <ChevronRight size={18} className="text-slate-400 group-hover/subitem:text-emerald-600 group-hover/subitem:translate-x-1 transition-all" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-xs font-medium text-slate-500">
                  আমাদের পুঠিয়া ডিজিটাল পোর্টাল
                </span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PopularCategoriesSection;

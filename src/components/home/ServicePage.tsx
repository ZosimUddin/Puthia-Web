import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SubMenuDetailLayout } from "../common/SubMenuDetailLayout";
import { 
  ArrowLeft, Search, PlusCircle, Plus, List, Phone, MapPin, Heart, 
  ShieldAlert, Loader2, CheckCircle2, Droplets, UserPlus, Trash2, ShieldCheck,
  Bus, Train, Clock, Info, Landmark, History, Building2, Stethoscope, Shield,
  Briefcase, GraduationCap, Users, Sprout, SlidersHorizontal, ArrowUpDown, X
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";
import { useAuth } from "../../contexts/AuthContext";
import { Sidebar } from "../Sidebar";
import { AuthModal } from "../AuthModal";
import { RepresentativesProfile } from "../RepresentativesProfile";
import { TouristSpots } from "../TouristSpots";
import { HospitalInfo } from "../HospitalInfo";
import { PoliceInfo } from "../PoliceInfo";
import { AmbulanceInfo } from "../AmbulanceInfo";
import { FireServiceInfo } from "../FireServiceInfo";
import { NgoSocial } from "../NgoSocial";
import { CareerGuidelineInfo } from "../CareerGuidelineInfo";
import { AgriServiceInfo } from "../AgriServiceInfo";
import { EduInstInfo } from "../EduInstInfo";
import { JobPortal } from "../JobPortal";
import { ServiceDirectoryTemplate } from "../common/MasterServiceTemplate/ServiceDirectoryTemplate";
import { TrainingHub } from "../TrainingHub";
import { BankingFinance } from "../BankingFinance";
import { InsuranceServices } from "../InsuranceServices";
import { CommunityEventsHub } from "../CommunityEventsHub";
import { LocalServiceProviderInfo } from "../LocalServiceProviderInfo";
import { GovtServicesInfo } from "../GovtServicesInfo";
import { UnionServices } from "../UnionServices";
import { NIDServicesInfo } from "../NIDServicesInfo";
import PassportServices from "../PassportServices";
import { LandServicesInfo } from "../LandServicesInfo";
import { RoadsTransport } from "../RoadsTransport";
import { db } from "../../firebase";
import { 
  collection, query, orderBy, onSnapshot, addDoc, doc, deleteDoc, serverTimestamp 
} from "firebase/firestore";
import { getAdCampaigns, incrementAdImpression, incrementAdClick } from "../../api";

const ServicePageAd: React.FC = () => {
  const [ad, setAd] = useState<any | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const campaigns = await getAdCampaigns();
        const activeAds = campaigns.filter(c => c.status === 'active' && c.slotType === 'service_page');
        if (activeAds.length > 0) {
          const selected = activeAds[Math.floor(Math.random() * activeAds.length)];
          setAd(selected);
          await incrementAdImpression(selected.id);
        }
      } catch (e) {
        console.error("Error fetching service page ad:", e);
      }
    };
    fetchAd();
  }, []);

  if (!ad) {
    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/5 to-teal-500/10 rounded-[20px] border border-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-emerald-600 font-bold">📢</span>
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800">আপনার ব্যবসা বা সেবার প্রচার বাড়াতে চান?</h4>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">পুঠিয়ার নাগরিকদের কাছে সহজেই বিজ্ঞাপন দিন</p>
          </div>
        </div>
        <a 
          href="/advertiser-dashboard" 
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shadow-md decoration-none text-center"
        >
          বিজ্ঞাপন শুরু করুন
        </a>
      </div>
    );
  }

  const handleAdClick = () => {
    incrementAdClick(ad.id, ad.cpc || 5).catch(err => console.error(err));
  };

  return (
    <div className="mb-6">
      <a 
        href={ad.link}
        onClick={handleAdClick}
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 bg-white hover:bg-emerald-50/20 border border-slate-100 hover:border-emerald-200/50 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 group decoration-none"
      >
        <div className="flex items-center gap-4">
          <img src={ad.imageUrl} alt={ad.campaignName} className="w-16 h-12 rounded-xl object-cover border border-slate-100" />
          <div>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-black uppercase rounded border border-amber-100 tracking-wider">স্পনসরড অফার</span>
            <h4 className="text-xs font-black text-slate-800 mt-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">{ad.campaignName}</h4>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">বিস্তারিত দেখতে এখানে ক্লিক করুন</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-slate-50 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white rounded-xl flex items-center justify-center transition-all shrink-0">
          <ArrowLeft size={14} className="rotate-180" />
        </div>
      </a>
    </div>
  );
};

export const toBanglaNumber = (num: number | string): string => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/[0-9]/g, (d) => banglaDigits[parseInt(d, 10)]);
};

const INITIAL_FALLBACK_DONORS = [
  { id: "fb-d1", name: "মোঃ তানভীর আহমেদ", bloodGroup: "O+", union: "পুঠিয়া সদর", village: "রাজবাড়ী সংলগ্ন", phone: "01712345678", lastDonated: "২ মাস আগে", status: "available", isVerified: true },
  { id: "fb-d2", name: "আরিফুল ইসলাম", bloodGroup: "A+", union: "বানেশ্বর", village: "বানেশ্বর বাজার", phone: "01812345679", lastDonated: "১ম বার রক্তদান", status: "available", isVerified: true },
  { id: "fb-d3", name: "মোঃ রফিকুল ইসলাম", bloodGroup: "B+", union: "জিউপাড়া", village: "পীরগাছা", phone: "01912345680", lastDonated: "৩ মাস আগে", status: "available", isVerified: true },
  { id: "fb-d4", name: "মেহজাবিন আক্তার", bloodGroup: "O-", union: "শিলমাড়িয়া", village: "সাধুপাড়া", phone: "01798765432", lastDonated: "১ মাস আগে", status: "available", isVerified: true },
  { id: "fb-d5", name: "হাবিবুর রহমান", bloodGroup: "AB+", union: "ভালুকগাছী", village: "ভালুকগাছী বাজার", phone: "01301234567", lastDonated: "৪ মাস আগে", status: "available", isVerified: true },
  { id: "fb-d6", name: "ইঞ্জিঃ সাব্বির হোসেন", bloodGroup: "B-", union: "পুঠিয়া পৌরসভা", village: "সদর হাসপাতাল রোড", phone: "01755443322", lastDonated: "২ মাস আগে", status: "available", isVerified: true },
  { id: "fb-d7", name: "মোঃ সুজন মাহমুদ", bloodGroup: "A-", union: "বানেশ্বর", village: "খোর্দ্দ গোবিন্দপুর", phone: "01844332211", lastDonated: "১ম বার রক্তদান", status: "available", isVerified: true },
  { id: "fb-d8", name: "মোঃ আশরাফুল আলম", bloodGroup: "AB-", union: "পুঠিয়া সদর", village: "সৈয়দপুর", phone: "01988776655", lastDonated: "৩ মাস আগে", status: "available", isVerified: true },
  { id: "fb-d9", name: "সাকিব হাসান", bloodGroup: "O+", union: "জিউপাড়া", village: "জিউপাড়া মোড়", phone: "01711223344", lastDonated: "১ মাস আগে", status: "available", isVerified: true },
  { id: "fb-d10", name: "মোছাঃ পারভীন বেগম", bloodGroup: "B+", union: "শিলমাড়িয়া", village: "দিঘলকান্দি", phone: "01822334455", lastDonated: "৫ মাস আগে", status: "available", isVerified: true }
];

const BUS_SCHEDULES = [
  {
    id: "bus-1",
    operator: "দেশ ট্রাভেলস (Desh Travels)",
    type: "এসি ও নন-এসি লাক্সারি (AC & Non-AC)",
    route: "পুঠিয়া ⇆ ঢাকা (সরাসরি)",
    timing: "সকাল ০৭:১৫, ০৯:৩০, দুপুর ১২:১৫, বিকেল ০৪:৪৫, রাত ০৯:৩০, ১০:৩০",
    ticketPrice: "নন-এসি: ৮০০ টাকা | এসি: ১২০০ - ১৫০০ টাকা",
    boarding: "পুঠিয়া বাস স্ট্যান্ড, বানেশ্বর ট্রাফিক মোড়",
    counters: [
      { name: "পুঠিয়া বাস স্ট্যান্ড কাউন্টার", phone: "01709-640003" },
      { name: "বানেশ্বর বাজার কাউন্টার", phone: "01709-640004" }
    ]
  },
  {
    id: "bus-2",
    operator: "ন্যাশনাল ট্রাভেলস (National Travels)",
    type: "এসি ও নন-এসি (AC & Non-AC)",
    route: "পুঠিয়া ⇆ ঢাকা (সরাসরি)",
    timing: "সকাল ০৬:৩০, ০৮:৪৫, ১১:০০, দুপুর ০১:৩০, বিকেল ০৩:৪৫, রাত ১০:০০, ১১:১৫",
    ticketPrice: "নন-এসি: ৮০০ টাকা | এসি: ১৩০০ - ১৫০০ টাকা",
    boarding: "পুঠিয়া বাজার কাউন্টার, বানেশ্বর মোড়",
    counters: [
      { name: "পুঠিয়া বাজার কাউন্টার", phone: "01713-149202" },
      { name: "বানেশ্বর মোড় কাউন্টার", phone: "01713-149205" }
    ]
  },
  {
    id: "bus-3",
    operator: "হানিফ এন্টারপ্রাইজ (Hanif Enterprise)",
    type: "নন-এসি (Non-AC)",
    route: "পুঠিয়া ⇆ ঢাকা (সরাসরি)",
    timing: "সকাল ০৭:০০, ১০:০০, দুপুর ০২:১৫, বিকেল ০৫:৩০, রাত ০৯:৪৫, ১০:৪৫",
    ticketPrice: "৮০০ টাকা (যাত্রী প্রতি)",
    boarding: "পুঠিয়া বাস স্ট্যান্ড, বানেশ্বর বাজার",
    counters: [
      { name: "পুঠিয়া কাউন্টার", phone: "01753-330330" },
      { name: "বানেশ্বর কাউন্টার", phone: "01753-330335" }
    ]
  },
  {
    id: "bus-4",
    operator: "শ্যামলী পরিবহন (Shyamoli Paribahan)",
    type: "এসি ও নন-এসি (AC & Non-AC)",
    route: "পুঠিয়া ⇆ ঢাকা (সরাসরি)",
    timing: "সকাল ০৮:০০, ১১:১৫, দুপুর ১২:৪৫, বিকেল ০৪:০০, রাত ১০:১৫, ১১:৩০",
    ticketPrice: "নন-এসি: ৮০০ টাকা | এসি: ১২০০ টাকা",
    boarding: "পুঠিয়া বাস স্ট্যান্ড",
    counters: [
      { name: "পুঠিয়া কাউন্টার", phone: "01733-366366" }
    ]
  },
  {
    id: "bus-5",
    operator: "লোকাল সার্ভিস (রাজশাহী - নাটোর - পাবনা)",
    type: "লোকাল / সিটিং সার্ভিস (Local)",
    route: "রাজশাহী ⇆ নাটোর ⇆ পাবনা (ভায়া পুঠিয়া)",
    timing: "সকাল ০৬:০০ থেকে রাত ০৯:০০ পর্যন্ত (প্রতি ১০-১৫ মিনিট পর পর গাড়ি ছেড়ে যায়)",
    ticketPrice: "পুঠিয়া - রাজশাহী: ৫০-৬০ টাকা | পুঠিয়া - নাটোর: ৪০-৫০ টাকা",
    boarding: "পুঠিয়া সদর, বানেশ্বর, ঝলমলিয়া, বেলপুকুর",
    counters: [
      { name: "সরাসরি বাস স্ট্যান্ড থেকে হেল্পারকে ভাড়া দিন", phone: "N/A" }
    ]
  }
];

const TRAIN_SCHEDULES = [
  {
    id: "train-1",
    name: "বনলতা এক্সপ্রেস (Banalata Express - 791/792)",
    route: "রাজশাহী ⇆ ঢাকা (সরাসরি)",
    offDay: "শুক্রবার (Friday)",
    timing: "রাজশাহী থেকে ছাড়ে: সকাল ০৭:৩০, ঢাকা পৌঁছায়: দুপুর ০১:০০ | ঢাকা থেকে ছাড়ে: দুপুর ০১:৩০, রাজশাহী পৌঁছায়: রাত ০৭:১০",
    ticketPrice: "শোভন চেয়ার: ৪২৫ টাকা | এসি চেয়ার: ৮২৫ টাকা | ক্যাবিন: ১০০০+ টাকা",
    boarding: "রাজশাহী রেলওয়ে স্টেশন (পুঠিয়া থেকে ৩০ কিমি)",
    note: "এটি একটি বিরতিহীন বিলাসবহুল আন্তঃনগর ট্রেন। এটি রাজশাহী থেকে ছেড়ে সরাসরি ঢাকা বিমানবন্দর ও কমলাপুর স্টেশনে থামে।"
  },
  {
    id: "train-2",
    name: "সিল্কসিটি এক্সপ্রেস (Silkcity Express - 753/754)",
    route: "রাজশাহী ⇆ ঢাকা (ভায়া আব্দুলপুর)",
    offDay: "রবিবার (Sunday)",
    timing: "রাজশাহী ছাড়ে: সকাল ০৭:৪০, আব্দুলপুর জংশন: সকাল ০৮:৩৫, ঢাকা পৌঁছায়: দুপুর ০১:৪৫ | ঢাকা ছাড়ে: দুপুর ০২:৪০, আব্দুলপুর: বিকেল ০৭:৪২, রাজশাহী পৌঁছায়: রাত ০৮:৩৫",
    ticketPrice: "শোভন চেয়ার: ৩৪০ টাকা | স্নিগ্ধা এসি: ৬৫কে টাকা",
    boarding: "রাজশাহী রেলওয়ে স্টেশন অথবা আব্দুলপুর জংশন (নাটোর - পুঠিয়া থেকে ২০ কিমি)",
    note: "আব্দুলপুর জংশনে পুঠিয়ার যাত্রীদের জন্য ট্রেনটি ৫ মিনিট থামে।"
  },
  {
    id: "train-3",
    name: "পদ্মা এক্সপ্রেস (Padma Express - 759/760)",
    route: "রাজশাহী ⇆ ঢাকা (ভায়া আব্দুলপুর)",
    offDay: "মঙ্গলবার (Tuesday)",
    timing: "রাজশাহী ছাড়ে: বিকেল ৪:০০, আব্দুলপুর জংশন: বিকেল ০৪:৫৮, ঢাকা পৌঁছায়: রাত ০৯:৪০ | ঢাকা ছাড়ে: রাত ১১:০০, আব্দুলপুর: রাত ০৩:৫৪, রাজশাহী পৌঁছায়: ভোর ০৪:৪৫",
    ticketPrice: "শোভন চেয়ার: ৩৪০ টাকা | স্নিগ্ধা এসি: ৬৫৬ টাকা | এসি সিট: ৭৮৮ টাকা",
    boarding: "রাজশাহী রেলওয়ে স্টেশন অথবা আব্দুলপুর জংশন",
    note: "পুঠিয়া থেকে নাটোর বা আব্দুলপুর স্টেশনে গিয়ে এই ট্রেনে খুব সহজে চড়া যায়।"
  },
  {
    id: "train-4",
    name: "ধূমকেতু এক্সপ্রেস (Dhumketu Express - 769/770)",
    route: "রাজশাহী ⇆ ঢাকা (ভায়া আব্দুলপুর)",
    offDay: "বৃহস্পতিবার (Thursday)",
    timing: "রাজশাহী ছাড়ে: রাত ১১:২০, আব্দুলপুর জংশন: রাত ১২:০৬, ঢাকা পৌঁছায়: ভোর ০৪:৫০ | ঢাকা ছাড়ে: সকাল ০৬:০০, আব্দুলপুর: সকাল ১০:৪৭, রাজশাহী পৌঁছায়: দুপুর ১১:৪০",
    ticketPrice: "শোভন চেয়ার: ৩৪০ টাকা | স্নিগ্ধা এসি: ৬৫৬ টাকা",
    boarding: "রাজশাহী রেলওয়ে স্টেশন অথবা আব্দুলপুর জংশন",
    note: "নাইট ট্রেন হিসেবে যাতায়াতের জন্য অত্যন্ত জনপ্রিয় ও আরামদায়ক।"
  },
  {
    id: "train-5",
    name: "মহানন্দা মেইল (Mahananda Mail - 15/16)",
    route: "রাজশাহী ⇆ খুলনা (ভায়া ঈশ্বরদী, কুষ্টিয়া)",
    offDay: "নেই (No Holiday)",
    timing: "রাজশাহী ছাড়ে: দুপুর ০৩:২০, খুলনা পৌঁছায়: রাত ১০:৩০ | খুলনা ছাড়ে: সকাল ১১:০০, রাজশাহী পৌঁছায়: সন্ধ্যা ০৬:১৫",
    ticketPrice: "শোভন সাধারণ: ৯০ টাকা",
    boarding: "রাজশাহী রেলওয়ে স্টেশন / আব্দুলপুর জংশন",
    note: "কম খরচে খুলনা ও ঈশ্বরদী যাতায়াতের সেরা লোকাল মেইল ট্রেন।"
  }
];

const LOCAL_FARES = [
  {
    id: "fare-1",
    from: "পুঠিয়া বাজার",
    to: "বানেশ্বর মোড়",
    distance: "৮ কিমি (মহাসড়ক)",
    autoFare: "২৫ টাকা (যাত্রী প্রতি)",
    cngFare: "২০ টাকা (যাত্রী প্রতি)",
    reserveAuto: "১২০ - ১৫০ টাকা",
    note: "মহাসড়ক দিয়ে দ্রুত যাতায়াতের জন্য সিএনজি ও লোকাল ইজিবাইক পাওয়া যায়।"
  },
  {
    id: "fare-2",
    from: "পুঠিয়া বাজার",
    to: "চারঘাট বাজার",
    distance: "১৬ কিমি",
    autoFare: "৪০ - ৫০ টাকা (যাত্রী প্রতি)",
    cngFare: "N/A",
    reserveAuto: "২০০ - ২৫০ টাকা",
    note: "সরাসরি অটো না পেলে বানেশ্বর হয়ে ভেঙ্গে চারঘাট যাওয়া সুবিধাজনক।"
  },
  {
    id: "fare-3",
    from: "পুঠিয়া বাজার",
    to: "বেলপুকুর বাইপাস",
    distance: "১২ কিমি",
    autoFare: "৩০ টাকা (যাত্রী প্রতি)",
    cngFare: "২৫ টাকা (যাত্রী প্রতি)",
    reserveAuto: "১৫০ - ১৮০ টাকা",
    note: "রাজশাহী বাইপাস রোডের প্রবেশদ্বার, রাজশাহী সদরের লোকাল বাস ধরার ভালো ইস্টার।"
  },
  {
    id: "fare-4",
    from: "পুঠিয়া বাজার",
    to: "ঝলমলিয়া বাজার",
    distance: "৪ কিমি",
    autoFare: "১৫ টাকা (যাত্রী প্রতি)",
    cngFare: "১০ টাকা (যাত্রী প্রতি)",
    reserveAuto: "৬০ - ৮০ টাকা",
    note: "পুঠিয়ার খুব কাছের ঝলমলিয়া বাজারে হাটের দিন যাতায়াত প্রচুর বাড়ে।"
  },
  {
    id: "fare-5",
    from: "পুঠিয়া বাজার",
    to: "পুঠিয়া রাজবাড়ী / জিরো ইস্টার",
    distance: "১.৫ কিমি (অভ্যন্তরীণ)",
    autoFare: "১০ টাকা (যাত্রী প্রতি)",
    cngFare: "N/A",
    reserveAuto: "৩০ - ৪০ টাকা",
    note: "ভ্যান অথবা ইজিবাইকে সরাসরি রাজবাড়ীর প্রধান ফটক বা জিরো ইস্টারে যাওয়া যায়।"
  }
];

interface ServicePageProps {
  title: string;
  type: string;
  initialCategory?: string;
}

const ServicePage: React.FC<ServicePageProps> = ({ title, type, initialCategory }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedSubView, setSelectedSubView] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Blood Donor Network Specific States
  const [activeBloodTab, setActiveBloodTab] = useState<"requests" | "donors" | "register">("donors");
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [bloodDonors, setBloodDonors] = useState<any[]>(INITIAL_FALLBACK_DONORS);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [donorsLoading, setDonorsLoading] = useState(false);
  
  // Filters for Donors
  const [donorSearch, setDonorSearch] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");
  const [selectedUnionFilter, setSelectedUnionFilter] = useState("all");

  // Read URL query search params for Blood Donor section
  useEffect(() => {
    if (type === "blood-donor") {
      const tabParam = searchParams.get("tab");
      const groupParam = searchParams.get("group");
      if (tabParam === "search" || tabParam === "donors") {
        setActiveBloodTab("donors");
      } else if (tabParam === "register") {
        setActiveBloodTab("register");
      } else if (tabParam === "requests") {
        setActiveBloodTab("requests");
      }
      
      if (groupParam) {
        setSelectedGroupFilter(groupParam);
        setActiveBloodTab("donors");
      }
    }
  }, [type, searchParams]);

  // Post Request Form States
  const [reqPatientName, setReqPatientName] = useState("");
  const [reqBloodGroup, setReqBloodGroup] = useState("O+");
  const [reqUnits, setReqUnits] = useState(1);
  const [reqHospital, setReqHospital] = useState("");
  const [reqLocation, setReqLocation] = useState("পুঠিয়া");
  const [reqContact, setReqContact] = useState("");
  const [reqNeededAt, setReqNeededAt] = useState("");
  const [reqDetails, setReqDetails] = useState("");
  const [reqIsCritical, setReqIsCritical] = useState(false);
  const [isPostingRequest, setIsPostingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Register Donor Form States
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regGroup, setRegGroup] = useState("O+");
  const [regUnion, setRegUnion] = useState("পুঠিয়া সদর");
  const [regVillage, setRegVillage] = useState("");
  const [regLastDonated, setRegLastDonated] = useState("");
  const [regIsAgreed, setRegIsAgreed] = useState(false);
  const [isRegisteringDonor, setIsRegisteringDonor] = useState(false);
  const [donorSuccess, setDonorSuccess] = useState(false);

  // Transport Specific States
  const [activeTransportTab, setActiveTransportTab] = useState<"bus" | "train" | "fare">("bus");
  const [busRouteFilter, setBusRouteFilter] = useState("all");
  const [trainStationFilter, setTrainStationFilter] = useState("all");
  const [transportSearch, setTransportSearch] = useState("");
  const [buses, setBuses] = useState<any[]>([]);
  const [trains, setTrains] = useState<any[]>([]);
  const [busesLoading, setBusesLoading] = useState(true);
  const [trainsLoading, setTrainsLoading] = useState(true);

  const UNIONS = [
    "পুঠিয়া পৌরসভা",
    "পুঠিয়া সদর",
    "বানেশ্বর",
    "জিউপাড়া",
    "শিলমাড়িয়া",
    "ভালুকগাছী"
  ];

  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Listen to Blood Requests from Firestore
  useEffect(() => {
    if (type !== "blood-donor") return;
    
    setRequestsLoading(true);
    const q = query(collection(db, "blood_requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setBloodRequests(list);
      setRequestsLoading(false);
    }, (error) => {
      if (error?.message?.includes("Quota") || error?.code === "resource-exhausted") {
        console.warn("Firestore quota limit reached for blood requests in ServicePage.");
      } else {
        console.warn("Error loading blood requests:", error?.message || error);
      }
      setRequestsLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, [type]);

  // Listen to Blood Donors from Firestore
  useEffect(() => {
    if (type !== "blood-donor") return;

    setDonorsLoading(true);
    const q = query(collection(db, "blood_donors"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setBloodDonors(list.length > 0 ? [...list, ...INITIAL_FALLBACK_DONORS] : INITIAL_FALLBACK_DONORS);
      setDonorsLoading(false);
    }, (error) => {
      console.error("Error loading blood donors:", error);
      setBloodDonors(INITIAL_FALLBACK_DONORS);
      setDonorsLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, [type]);

  // Listen to Bus Schedules from Firestore
  useEffect(() => {
    if (type !== "transport") return;

    setBusesLoading(true);
    const q = query(collection(db, "bus_schedules"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setBuses(list);
      setBusesLoading(false);
    }, (error) => {
      console.error("Error loading bus schedules:", error);
      setBusesLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, [type]);

  // Listen to Train Schedules from Firestore
  useEffect(() => {
    if (type !== "transport") return;

    setTrainsLoading(true);
    const q = query(collection(db, "train_schedules"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setTrains(list);
      setTrainsLoading(false);
    }, (error) => {
      console.error("Error loading train schedules:", error);
      setTrainsLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, [type]);

  const handleNavigate = (path: string) => {
    setIsSidebarOpen(false);
    const targetPath = path.startsWith('/') ? path : `/${path}`;
    navigate(targetPath);
  };

  // Submit Blood Request Form
  const handlePostRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!reqPatientName || !reqHospital || !reqContact || !reqNeededAt) {
      alert("দয়া করে সব তারকা (*) চিহ্নিত ফিল্ডগুলো পূরণ করুন ভাই।");
      return;
    }

    setIsPostingRequest(true);
    try {
      await addDoc(collection(db, "blood_requests"), {
        patientName: reqPatientName,
        bloodGroup: reqBloodGroup,
        units: Number(reqUnits),
        hospital: reqHospital,
        location: reqLocation,
        contactNumber: reqContact,
        neededAt: reqNeededAt,
        details: reqDetails,
        isCritical: reqIsCritical,
        status: "pending",
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      // Clear Form
      setReqPatientName("");
      setReqUnits(1);
      setReqHospital("");
      setReqContact("");
      setReqNeededAt("");
      setReqDetails("");
      setReqIsCritical(false);
      
      setRequestSuccess(true);
      setTimeout(() => setRequestSuccess(false), 3000);
    } catch (error) {
      console.error("Error posting blood request:", error);
      alert("পোস্ট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsPostingRequest(false);
    }
  };

  // Register Donor Form
  const handleRegisterDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!regName || !regPhone || !regVillage) {
      alert("দয়া করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।");
      return;
    }

    if (!regIsAgreed) {
      alert("নিবন্ধনের জন্য শর্তাবলীতে সম্মত হওয়া প্রয়োজন।");
      return;
    }

    setIsRegisteringDonor(true);
    try {
      await addDoc(collection(db, "blood_donors"), {
        name: regName,
        phone: regPhone,
        bloodGroup: regGroup,
        union: regUnion,
        village: regVillage,
        lastDonated: regLastDonated || "১ম বার রক্তদান",
        status: "available",
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      // Clear Form
      setRegName("");
      setRegPhone("");
      setRegVillage("");
      setRegLastDonated("");
      setRegIsAgreed(false);

      setDonorSuccess(true);
      setTimeout(() => {
        setDonorSuccess(false);
        setActiveBloodTab("donors");
      }, 2500);
    } catch (error) {
      console.error("Error registering donor:", error);
      alert("নিবন্ধন সম্পন্ন করা যায়নি। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsRegisteringDonor(false);
    }
  };

  // Delete Request
  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই রক্তের রিকোয়েস্টটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "blood_requests", id));
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  // Filter Donors
  const filteredDonors = bloodDonors.filter(donor => {
    const matchesSearch = donor.name?.toLowerCase().includes(donorSearch.toLowerCase()) || 
                          donor.village?.toLowerCase().includes(donorSearch.toLowerCase()) ||
                          donor.phone?.includes(donorSearch);
    const matchesGroup = selectedGroupFilter === "all" || donor.bloodGroup === selectedGroupFilter;
    const matchesUnion = selectedUnionFilter === "all" || donor.union === selectedUnionFilter;
    return matchesSearch && matchesGroup && matchesUnion;
  });

  if (type === "blood-donor") {
    return (
      <div className="min-h-screen bg-slate-50 font-['Hind_Siliguri'] relative flex flex-col">
        <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} />
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onNavigate={handleNavigate}
        />

        {/* Banner Section */}
        <div className="bg-[#006a4e] text-white pt-4 pb-14 px-4 sm:px-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto space-y-3.5 relative z-10">
            {/* Top Navigation & Action Row inside Banner */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="ফিরে যান"
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white flex items-center justify-center transition-all border-none cursor-pointer backdrop-blur-md"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBloodTab("register")}
                  className="py-1.5 px-3 bg-white hover:bg-emerald-50 text-[#006a4e] text-xs font-black rounded-xl flex items-center gap-1 shadow-md border-none cursor-pointer transition-all active:scale-95"
                >
                  <Plus size={15} className="text-[#006a4e] stroke-[2.5]" />
                  <span>রক্তদাতা যোগ করুন</span>
                </button>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="pt-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>রক্তদাতা নেটওয়ার্ক</span>
                <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                  {toBanglaNumber(bloodDonors.length)} জন
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100/95 font-medium leading-relaxed mt-1">
                পুঠিয়া উপজেলার রক্তদাতা ও জরুরি রক্তের যোগাযোগের নির্ভরযোগ্য তথ্য।
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 -mt-6 relative z-20 space-y-3.5 pb-28">

          {/* Search, Filter & Tab Bar */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl h-11 px-3 shadow-md border border-slate-100 flex items-center gap-2">
              <Search size={17} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={donorSearch}
                onChange={(e) => setDonorSearch(e.target.value)}
                placeholder="রক্তদাতার নাম, এলাকা বা ফোন নম্বর লিখুন..."
                className="w-full bg-transparent border-none text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 outline-none truncate"
              />
              {donorSearch && (
                <button
                  type="button"
                  onClick={() => setDonorSearch("")}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 border-none bg-transparent cursor-pointer shrink-0"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Union Filter */}
            <div className="relative shrink-0">
              <select
                value={selectedUnionFilter}
                onChange={(e) => setSelectedUnionFilter(e.target.value)}
                className="h-11 px-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl border border-slate-100 shadow-md cursor-pointer appearance-none outline-none pr-8"
              >
                <option value="all">সকল এলাকা</option>
                {UNIONS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <SlidersHorizontal size={14} className="text-[#006a4e] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Blood Group Filter Chips (Doctor Specialty style) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedGroupFilter("all")}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                selectedGroupFilter === "all"
                  ? "bg-[#006a4e] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>সকল গ্রুপ</span>
              <span className="text-[10px] opacity-80">({toBanglaNumber(bloodDonors.length)})</span>
            </button>
            {BLOOD_GROUPS.map(g => {
              const count = bloodDonors.filter(d => d.bloodGroup === g).length;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGroupFilter(g)}
                  className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                    selectedGroupFilter === g
                      ? "bg-[#006a4e] text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span className="text-red-500 font-black">{g}</span>
                  {count > 0 && <span className="text-[10px] opacity-80">({toBanglaNumber(count)})</span>}
                </button>
              );
            })}
          </div>

          {/* 3 Tabs Segmented Switcher */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-white border border-slate-100 rounded-2xl shadow-xs">
            <button
              type="button"
              onClick={() => setActiveBloodTab("donors")}
              className={`py-2.5 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                activeBloodTab === "donors"
                  ? "bg-[#006a4e] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 bg-transparent"
              }`}
            >
              <Droplets size={15} />
              <span>রক্তদাতা ({toBanglaNumber(filteredDonors.length)})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveBloodTab("requests")}
              className={`py-2.5 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                activeBloodTab === "requests"
                  ? "bg-[#006a4e] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 bg-transparent"
              }`}
            >
              <List size={15} />
              <span>রক্তের চাহিদা ({toBanglaNumber(bloodRequests.length)})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveBloodTab("register")}
              className={`py-2.5 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                activeBloodTab === "register"
                  ? "bg-[#006a4e] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 bg-transparent"
              }`}
            >
              <UserPlus size={15} />
              <span>দাতা নিবন্ধন</span>
            </button>
          </div>

          {/* Tab 1: Blood Donors Directory */}
          {activeBloodTab === "donors" && (
            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-black text-slate-800">
                  রক্তদাতা তালিকা ({toBanglaNumber(filteredDonors.length)} জন)
                </h3>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck size={12} className="fill-current text-white" />
                  সক্রিয় রক্তদাতা
                </span>
              </div>

              {donorsLoading ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
                  <Loader2 size={32} className="text-[#006a4e] animate-spin mb-3" />
                  <p className="text-xs font-bold text-slate-500">রক্তদাতাদের তালিকা লোড হচ্ছে...</p>
                </div>
              ) : filteredDonors.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center max-w-md mx-auto shadow-xs">
                  <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
                    ❤️
                  </div>
                  <h4 className="text-base font-black text-slate-800 mb-1">কোনো রক্তদাতা পাওয়া যায়নি</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed mb-4">
                    আপনার নির্বাচিত ফিল্টার বা খোঁজা তথ্য অনুযায়ী কোনো রক্তদাতা পাওয়া যায়নি।
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDonorSearch("");
                      setSelectedGroupFilter("all");
                      setSelectedUnionFilter("all");
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer border-none"
                  >
                    অনুসন্ধান রিসেট করুন
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredDonors.map((donor, idx) => (
                    <motion.div
                      key={donor.id || idx}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border border-red-100">
                            {donor.bloodGroup}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800 leading-tight">{donor.name}</h4>
                            <p className="text-[11px] font-bold text-slate-400 flex items-center gap-0.5 mt-1">
                              <MapPin size={11} />
                              <span>{donor.village}, {donor.union}</span>
                            </p>
                          </div>
                        </div>

                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                          রেডি ডোনার
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <span>🕒 শেষ রক্তদান:</span>
                        <span className="text-slate-800 font-extrabold">{donor.lastDonated || "১ম বার রক্তদান"}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <a
                          href={`tel:${donor.phone}`}
                          className="bg-[#006a4e] hover:bg-emerald-800 text-white text-center py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer decoration-none shadow-xs"
                        >
                          <Phone size={13} fill="currentColor" />
                          <span>কল করুন</span>
                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?phone=${donor.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-center py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer border border-emerald-200 decoration-none"
                        >
                          💬 হোয়াটসঅ্যাপ
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Live Blood Requests List & Form */}
          {activeBloodTab === "requests" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pt-1">
              {/* Left Column: Form to request blood */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <PlusCircle className="text-red-500" size={18} />
                    <span>রক্তের পোস্ট করুন</span>
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">রোগীর জন্য রক্তের রিকোয়েস্ট তৈরি করুন</p>
                </div>

                {requestSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>রক্তের আবেদনটি সফলভাবে প্রকাশ করা হয়েছে!</span>
                  </motion.div>
                )}

                <form onSubmit={handlePostRequest} className="space-y-3.5 text-left">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600">রোগীর সমস্যা/বিবরণ *</label>
                    <input
                      type="text"
                      value={reqPatientName || ""}
                      onChange={(e) => setReqPatientName(e.target.value)}
                      required
                      placeholder="উদাঃ সিজারিয়ান অপারেশন"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-600">রক্তের গ্রুপ *</label>
                      <select
                        value={reqBloodGroup || ""}
                        onChange={(e) => setReqBloodGroup(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold text-red-600"
                      >
                        {BLOOD_GROUPS.map(g => (
                          <option key={g} value={g || ""}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-600">পরিমাণ (ব্যাগ) *</label>
                      <input
                        type="number"
                        min="1"
                        value={reqUnits || ""}
                        onChange={(e) => setReqUnits(Number(e.target.value))}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600">হাসপাতালের নাম ও ঠিকানা *</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={reqHospital || ""}
                        onChange={(e) => setReqHospital(e.target.value)}
                        required
                        placeholder="উদাঃ পুঠিয়া স্বাস্থ্য কমপ্লেক্স"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-600">এলাকা/ইউনিয়ন *</label>
                      <select
                        value={reqLocation || ""}
                        onChange={(e) => setReqLocation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold"
                      >
                        <option value="পুঠিয়া">পুঠিয়া (সার্বিক)</option>
                        {UNIONS.map(u => (
                          <option key={u} value={u || ""}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-600">কখন লাগবে? *</label>
                      <input
                        type="text"
                        value={reqNeededAt || ""}
                        onChange={(e) => setReqNeededAt(e.target.value)}
                        required
                        placeholder="উদাঃ আজ বিকেলে"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600">মোবাইল নম্বর *</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        maxLength={11}
                        value={reqContact || ""}
                        onChange={(e) => setReqContact(e.target.value)}
                        required
                        placeholder="01700000000"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600">অতিরিক্ত বিবরণ (ঐচ্ছিক)</label>
                    <textarea
                      value={reqDetails || ""}
                      onChange={(e) => setReqDetails(e.target.value)}
                      placeholder="রোগীর অবস্থা বা বিশেষ নোট..."
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold resize-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-100 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reqIsCritical}
                      onChange={(e) => setReqIsCritical(e.target.checked)}
                      className="rounded text-red-600 cursor-pointer accent-red-600 h-4 w-4 shrink-0"
                    />
                    <span className="text-[10px] font-black text-red-700 leading-tight">
                      রোগীর অবস্থা অত্যন্ত আশঙ্কাজনক বা অতি দ্রুত রক্তের প্রয়োজন
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isPostingRequest}
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 border-none cursor-pointer"
                  >
                    {isPostingRequest ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>পোস্ট আপলোড হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Heart size={15} className="fill-current" />
                        <span>রক্তের পোস্ট প্রকাশ করুন</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Live Blood Requests List */}
              <div className="lg:col-span-7 space-y-3.5">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-black text-slate-800">আজকের সক্রিয় রক্তের চাহিদা</h3>
                  <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    লাইভ আপডেট
                  </span>
                </div>

                {requestsLoading ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                    <Loader2 size={32} className="text-red-500 animate-spin mb-3" />
                    <p className="text-xs font-bold text-slate-500">লোড হচ্ছে...</p>
                  </div>
                ) : bloodRequests.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center space-y-3">
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                      <Heart size={24} />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">বর্তমানে কোনো রক্তের চাহিদা পোস্ট করা নেই</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                      পুঠিয়ার বিভিন্ন হাসপাতালে রক্তের জরুরি কোনো চাহিদা থাকলে এখানে পাওয়া যাবে। নতুন চাহিদা পোস্ট করতে বাম পাশের ফর্মটি ব্যবহার করুন।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bloodRequests.map((req) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col gap-3"
                      >
                        {req.isCritical && (
                          <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 animate-pulse">
                            <ShieldAlert size={10} />
                            <span>CRITICAL</span>
                          </div>
                        )}

                        {user && req.userId === user.uid && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(req.id)}
                            className="absolute right-3 top-3 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors border-none bg-transparent cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}

                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border border-red-100">
                            {req.bloodGroup}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800 leading-none">{req.patientName}</h4>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-slate-400 text-[11px] font-bold">
                              <span className="flex items-center gap-1">
                                <MapPin size={11} />
                                <span>{req.hospital}</span>
                              </span>
                              <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                              <span>{req.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600">
                          <div>
                            <span className="text-[10px] text-slate-400 block">🩸 পরিমাণ</span>
                            <span>{req.units} ব্যাগ</span>
                          </div>
                          <div className="border-l border-slate-200 pl-2.5">
                            <span className="text-[10px] text-slate-400 block">🕒 সময়সীমা</span>
                            <span className="text-red-600">{req.neededAt}</span>
                          </div>
                        </div>

                        {req.details && (
                          <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-500 font-medium">
                            {req.details}
                          </div>
                        )}

                        <a
                          href={`tel:${req.contactNumber}`}
                          className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer decoration-none"
                        >
                          <Phone size={13} fill="currentColor" />
                          <span>স্বজনের সাথে কথা বলুন</span>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Register as voluntary blood donor */}
          {activeBloodTab === "register" && (
            <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5 relative overflow-hidden">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <UserPlus size={20} className="text-[#006a4e]" />
                  <span>রক্তদাতা হিসেবে নিবন্ধন</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  স্বেচ্ছায় রক্তদাতা হিসেবে আজই আপনার নাম তালিকাভুক্ত করুন।
                </p>
              </div>

              {donorSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2 text-center"
                >
                  <CheckCircle2 size={16} className="mx-auto" />
                  <span>ধন্যবাদ! রক্তদাতা হিসেবে আপনার নিবন্ধন সফলভাবে সম্পন্ন হয়েছে।</span>
                </motion.div>
              )}

              <form onSubmit={handleRegisterDonor} className="space-y-3.5 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-600 block">১. রক্তদাতার সম্পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ মোঃ আরিফুল ইসলাম"
                    value={regName || ""}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">২. রক্তের গ্রুপ *</label>
                    <select
                      value={regGroup || ""}
                      onChange={(e) => setRegGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold text-red-600"
                    >
                      {BLOOD_GROUPS.map(g => (
                        <option key={g} value={g || ""}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">৩. মোবাইল নম্বর *</label>
                    <input
                      type="tel"
                      required
                      maxLength={11}
                      placeholder="উদাঃ 01700000000"
                      value={regPhone || ""}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">৪. ইউনিয়ন নির্বাচন করুন *</label>
                    <select
                      value={regUnion || ""}
                      onChange={(e) => setRegUnion(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold"
                    >
                      {UNIONS.map(u => (
                        <option key={u} value={u || ""}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">৫. গ্রাম বা মহল্লার নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ গোপালপুর"
                      value={regVillage || ""}
                      onChange={(e) => setRegVillage(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-600 block">৬. শেষ রক্তদানের তারিখ (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="উদাঃ ৩ মাস আগে বা ১ম বার"
                    value={regLastDonated || ""}
                    onChange={(e) => setRegLastDonated(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] outline-none text-xs font-bold"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regIsAgreed}
                      onChange={(e) => setRegIsAgreed(e.target.checked)}
                      className="rounded text-[#006a4e] accent-[#006a4e] mt-0.5 cursor-pointer h-4 w-4 shrink-0"
                    />
                    <span className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      আমি শপথ করছি যে রক্তদানের সকল নিয়মানুযায়ী আমি একজন সুস্থ ব্যক্তি। মানবতার কল্যাণে যেকোনো প্রয়োজনে আমার সাথে স্বজনদের যোগাযোগ করার অনুমোদন প্রদান করছি।
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isRegisteringDonor}
                  className="w-full py-3 px-4 bg-[#006a4e] hover:bg-emerald-800 disabled:bg-emerald-300 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 border-none cursor-pointer"
                >
                  {isRegisteringDonor ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>নিবন্ধন সম্পন্ন হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>রক্তদাতা হিসেবে নিবন্ধন সম্পন্ন করুন</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </main>
        
        <Footer />
        <BottomNavigation activeTab="services" onTabChange={() => {}} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  if (type === "transport") {
    return <ServiceDirectoryTemplate serviceKeyParam="local-transport" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Hind_Siliguri']">
      <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={handleNavigate}
      />
      
      <main className="pb-24 lg:pb-8 pt-2">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-5">
          <ServicePageAd />
          
          {/* Administration Feature View */}
          {type === "administration" ? (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2.5 hover:bg-white border border-slate-100 rounded-2xl transition-all shadow-sm"
                >
                  <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-black text-slate-800 leading-tight">{title}</h1>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5 text-orange-500">
                    ডিজিটাল সেবা ডিরেক্টরি
                  </p>
                </div>
              </div>

              <SubMenuDetailLayout 
                title="উপজেলা প্রশাসন ও পরিচিতি"
                description="পুঠিয়া উপজেলা রাজশাহী বিভাগের রাজশাহী জেলার একটি গুরুত্বপূর্ণ উপজেলা। এটি ইতিহাস ও ঐতিহ্যে সমৃদ্ধ একটি জনপদ। উপজেলা প্রশাসন নাগরিকদের সেবা প্রদানে এবং এলাকার সার্বিক উন্নয়নে নিরলস কাজ করে যাচ্ছে। এখানে উপজেলা নির্বাহী কর্মকর্তার কার্যালয়, উপজেলা পরিষদ এবং বিভিন্ন সরকারি দপ্তরের সমন্বয়ে প্রশাসনিক কার্যক্রম পরিচালিত হয়।"
                coverImage="https://images.unsplash.com/photo-1596422846543-75c6fc18a593?auto=format&fit=crop&q=80&w=1200"
                contactInfo={[
                  { label: "কার্যালয়", value: "উপজেলা নির্বাহী কর্মকর্তার কার্যালয়, পুঠিয়া", icon: <Building2 size={16} /> },
                  { label: "ঠিকানা", value: "পুঠিয়া সদর, রাজশাহী-৬২৪০", icon: <MapPin size={16} /> },
                  { label: "ফোন", value: "০৭২২-৫৬০০১", icon: <Phone size={16} /> },
                  { label: "ইমেইল", value: "unoputhia@mopa.gov.bd", icon: <Info size={16} /> }
                ]}
                callNumber="01711122334"
                websiteUrl="http://puthia.rajshahi.gov.bd"
                mapLocation="পুঠিয়া উপজেলা পরিষদ"
                isFeatured={true}
                featuredText="সরকারি সেবা হাব"
              />
              
              <div className="pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl">
                    <List size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">জনপ্রতিনিধি ও কর্মকর্তাবৃন্দ</h3>
                </div>
                <RepresentativesProfile />
              </div>
            </div>
          ) : type === "history" ? (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2.5 hover:bg-white border border-slate-100 rounded-2xl transition-all shadow-sm"
                >
                  <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-black text-slate-800 leading-tight">{title}</h1>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5 text-orange-500">
                    ঐতিহাসিক প্রত্নতাত্ত্বিক তথ্য
                  </p>
                </div>
              </div>

              <SubMenuDetailLayout 
                title="ইতিহাস ও ঐতিহ্য - পুঠিয়া রাজবাড়ী"
                description={`পুঠিয়া রাজবাড়ী রাজশাহী জেলার পুঠিয়া উপজেলায় অবস্থিত একটি প্রাচীন রাজবাড়ী। এটি বাংলাদেশের অন্যতম প্রত্নতাত্ত্বিক নিদর্শন। ষোড়শ শতাব্দীতে পুঠিয়া রাজবংশ প্রতিষ্ঠিত হয়েছিল। পুঠিয়া রাজবাড়ীর মন্দিরগুলো বাংলাদেশের পোড়ামাটির স্থাপত্যের সবচেয়ে সুন্দর নিদর্শন হিসেবে পরিচিত। 

এখানে পাঁচটি প্রধান মন্দির রয়েছে: 
১. পঞ্চরত্ন শিব মন্দির
২. গোবিন্দ মন্দির
৩. অান্নিক মন্দির 
৪. জগন্নাথ মন্দির
৫. দোল মন্দির

পুঠিয়া রাজবাড়ী চত্বরটি বিশাল একটি এলাকা জুড়ে বিস্তৃত, যেখানে রাজবাড়ীর প্রধান ভবন এবং এর চারপাশে বিভিন্ন মন্দির ও দিঘি রয়েছে। প্রতি বছর দেশ-বিদেশ থেকে হাজার হাজার পর্যটক এই ঐতিহাসিক স্থানটি পরিদর্শন করতে আসেন।`}
                coverImage="https://images.unsplash.com/photo-1596422846543-75c6fc18a593?auto=format&fit=crop&q=80&w=1200"
                contactInfo={[
                  { label: "স্থাপিত", value: "ষোড়শ শতাব্দী", icon: <History size={16} /> },
                  { label: "অবস্থান", value: "পুঠিয়া সদর, রাজশাহী", icon: <MapPin size={16} /> },
                  { label: "নিদর্শন", value: "শিব মন্দির, গোবিন্দ মন্দির, রাজবাড়ী", icon: <Landmark size={16} /> }
                ]}
                photoGallery={[
                  "https://images.unsplash.com/photo-1596422846543-75c6fc18a593?auto=format&fit=crop&q=80&w=600",
                  "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=600",
                  "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=600"
                ]}
                mapLocation="পুঠিয়া রাজবাড়ী, পুঠিয়া"
                isFeatured={true}
                featuredText="ঐতিহাসিক স্থান"
              />
            </div>
          ) : type === "blood-donor" ? (
            <div className="space-y-6">
              
              {/* Cover Hero Banner with integrated top action bar */}
              <div className="bg-gradient-to-br from-red-600 via-red-700 to-rose-900 text-white p-5 sm:p-8 rounded-[28px] sm:rounded-[36px] relative overflow-hidden shadow-xl shadow-red-900/15 border border-red-500/20">
                <div className="absolute right-0 bottom-0 w-72 h-72 text-white/5 -mb-20 -mr-20 pointer-events-none">
                  <Heart size={288} className="fill-current animate-pulse" />
                </div>

                {/* Top Action Icons Bar inside card */}
                <div className="relative z-10 flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => navigate(-1)}
                      className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition cursor-pointer border border-white/20 shadow-sm backdrop-blur-md"
                      aria-label="Back"
                      title="ফিরে যান"
                    >
                      <ArrowLeft size={18} className="text-white" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner shrink-0">
                      <Droplets size={18} className="text-red-100 fill-current" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveBloodTab("donors");
                      }}
                      className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition cursor-pointer border border-white/20 shadow-sm backdrop-blur-md"
                      title="রক্তদাতা সার্চ করুন"
                    >
                      <Search size={18} />
                    </button>
                    <button
                      onClick={() => setActiveBloodTab("register")}
                      className="w-10 h-10 rounded-full bg-white hover:bg-red-50 text-red-600 active:scale-95 flex items-center justify-center transition cursor-pointer shadow-md shrink-0"
                      title="রক্তদাতা হিসেবে নিবন্ধন করুন"
                    >
                      <Plus size={20} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Banner Content */}
                <div className="relative z-10 max-w-3xl space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 text-white">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                      লাইভ ব্লাড ব্যাংক নেটওয়ার্ক
                    </span>
                    <span className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-red-100">
                      পুঠিয়া উপজেলা
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                    জরুরি রক্তের প্রয়োজন? রক্তদাতা ও অনুরোধ এক জায়গায়!
                  </h2>
                  <p className="text-red-100 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
                    পুঠিয়া উপজেলার নিবন্ধিত রক্তদাতাদের সাথে রোগীর স্বজনদের রিয়েল-টাইম যোগাযোগের প্ল্যাটফর্ম। সরাসরি কল করুন বা আপনার জরুরি রক্তের পোস্ট দিন।
                  </p>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    <div className="bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                      <div className="text-xl font-black text-white">{bloodDonors.length} জন</div>
                      <div className="text-[10px] text-red-200 font-bold">উপলব্ধ রক্তদাতা</div>
                    </div>
                    <div className="bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                      <div className="text-xl font-black text-amber-300">{bloodRequests.length} টি</div>
                      <div className="text-[10px] text-red-200 font-bold">জরুরি চাহিদা</div>
                    </div>
                    <div className="bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                      <div className="text-xl font-black text-white">৬ টি</div>
                      <div className="text-[10px] text-red-200 font-bold">ইউনিয়ন কাভারেজ</div>
                    </div>
                    <div className="bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                      <div className="text-xl font-black text-emerald-300">১০০%</div>
                      <div className="text-[10px] text-red-200 font-bold">স্বেচ্ছাসেবী সেবা</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs Menu */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                <button
                  onClick={() => setActiveBloodTab("donors")}
                  className={`py-3.5 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                    activeBloodTab === "donors"
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Droplets size={18} />
                  <span>রক্তদাতা খুঁজুন ({bloodDonors.length})</span>
                </button>
                <button
                  onClick={() => setActiveBloodTab("requests")}
                  className={`py-3.5 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                    activeBloodTab === "requests"
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <List size={18} />
                  <span>রক্তের চাহিদা ({bloodRequests.length})</span>
                </button>
                <button
                  onClick={() => setActiveBloodTab("register")}
                  className={`py-3.5 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                    activeBloodTab === "register"
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <UserPlus size={18} />
                  <span>দাতা নিবন্ধন</span>
                </button>
              </div>

              {/* Tab 1: Live Blood Requests List & Form */}
              {activeBloodTab === "requests" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Form to request blood */}
                  <div className="lg:col-span-5 bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <PlusCircle className="text-red-500" size={20} />
                        <span>রক্তের পোস্ট করুন</span>
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">রোগীর জন্য রক্তের রিকোয়েস্ট তৈরি করুন</p>
                    </div>

                    {requestSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl text-xs font-bold flex items-center gap-2"
                      >
                        <CheckCircle2 size={16} />
                        <span>রক্তের আবেদনটি সফলভাবে প্রকাশ করা হয়েছে!</span>
                      </motion.div>
                    )}

                    <form onSubmit={handlePostRequest} className="space-y-4 text-left">
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-600">রোগীর সমস্যা/বিবরণ *</label>
                        <input
                          type="text"
                          value={reqPatientName || ""}
                          onChange={(e) => setReqPatientName(e.target.value)}
                          required
                          placeholder="উদাঃ সিজারিয়ান অপারেশন (গর্ভবতী মা)"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-extrabold text-slate-600">রক্তের গ্রুপ *</label>
                          <select
                            value={reqBloodGroup || ""}
                            onChange={(e) => setReqBloodGroup(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold text-red-600"
                          >
                            {BLOOD_GROUPS.map(g => (
                              <option key={g} value={g || ""}>{g}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-extrabold text-slate-600">পরিমাণ (ব্যাগ) *</label>
                          <input
                            type="number"
                            min="1"
                            value={reqUnits || ""}
                            onChange={(e) => setReqUnits(Number(e.target.value))}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-600">হাসপাতালের নাম ও ঠিকানা *</label>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={reqHospital || ""}
                            onChange={(e) => setReqHospital(e.target.value)}
                            required
                            placeholder="উদাঃ পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স"
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-extrabold text-slate-600">এলাকা/ইউনিয়ন *</label>
                          <select
                            value={reqLocation || ""}
                            onChange={(e) => setReqLocation(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold"
                          >
                            <option value="পুঠিয়া">পুঠিয়া (সার্বিক)</option>
                            {UNIONS.map(u => (
                              <option key={u} value={u || ""}>{u}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-extrabold text-slate-600">কখন লাগবে? *</label>
                          <input
                            type="text"
                            value={reqNeededAt || ""}
                            onChange={(e) => setReqNeededAt(e.target.value)}
                            required
                            placeholder="উদাঃ আজ সন্ধ্যার মধ্যে"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-600">মোবাইল নম্বর (রোগীর স্বজন) *</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            maxLength={11}
                            value={reqContact || ""}
                            onChange={(e) => setReqContact(e.target.value)}
                            required
                            placeholder="উদাঃ 01700000000"
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-600">অতিরিক্ত বিবরণ (ঐচ্ছিক)</label>
                        <textarea
                          value={reqDetails || ""}
                          onChange={(e) => setReqDetails(e.target.value)}
                          placeholder="রোগীর অবস্থা বা রক্তের অন্য কোনো বিশেষ রিকোয়েস্ট থাকলে লিখুন..."
                          rows={2}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold resize-none"
                        />
                      </div>

                      <label className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reqIsCritical}
                          onChange={(e) => setReqIsCritical(e.target.checked)}
                          className="rounded text-red-600 cursor-pointer accent-red-600 h-4 w-4 shrink-0"
                        />
                        <span className="text-[10px] font-black text-red-700 leading-tight">
                          রোগীর অবস্থা অত্যন্ত আশঙ্কাজনক বা অতি দ্রুত রক্তের প্রয়োজন (Critical Urgency Tag)
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={isPostingRequest}
                        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-red-200 flex items-center justify-center gap-2 border-none cursor-pointer"
                      >
                        {isPostingRequest ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>পোস্ট আপলোড হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Heart size={16} className="fill-current" />
                            <span>রক্তের পোস্ট প্রকাশ করুন</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Live Blood Requests List */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-md font-black text-slate-800">আজকের সক্রিয় রক্তের চাহিদা</h3>
                      <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-[10px] font-bold">
                        লাইভ আপডেট
                      </span>
                    </div>

                    {requestsLoading ? (
                      <div className="bg-white border border-slate-100 rounded-[24px] p-12 text-center flex flex-col items-center justify-center">
                        <Loader2 size={32} className="text-red-500 animate-spin mb-3" />
                        <p className="text-xs font-bold text-slate-500">ডাটা লোড হচ্ছে ভাই, অনুগ্রহ করে অপেক্ষা করুন...</p>
                      </div>
                    ) : bloodRequests.length === 0 ? (
                      <div className="bg-white border border-slate-100 rounded-[24px] p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                          <Heart size={28} />
                        </div>
                        <h4 className="text-base font-bold text-slate-800">বর্তমানে কোনো রক্তের চাহিদা পোস্ট করা নেই</h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                          পুঠিয়ার বিভিন্ন হাসপাতালে রক্তের জরুরি কোনো চাহিদা থাকলে এখানে পাওয়া যাবে। নতুন চাহিদা পোস্ট করতে বাম পাশের ফর্মটি ব্যবহার করুন ভাই।
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bloodRequests.map((req) => (
                          <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm relative overflow-hidden flex flex-col gap-4"
                          >
                            {/* Critical Badge */}
                            {req.isCritical && (
                              <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1 animate-pulse">
                                <ShieldAlert size={10} />
                                <span>CRITICAL URGENT</span>
                              </div>
                            )}

                            {/* Author Trash Action */}
                            {user && req.userId === user.uid && (
                              <button
                                onClick={() => handleDeleteRequest(req.id)}
                                className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors border-none bg-transparent cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}

                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-md font-black shrink-0 border border-red-100/50">
                                {req.bloodGroup}
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-base font-black text-slate-800 leading-none">{req.patientName}</h4>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-slate-400 text-[11px] font-bold">
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    <span>{req.hospital}</span>
                                  </span>
                                  <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                                  <span>{req.location}</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-slate-400">🩸 পরিমাণ</span>
                                <span>{req.units} ব্যাগ</span>
                              </div>
                              <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-3">
                                <span className="text-[10px] text-slate-400">🕒 সময়সীমা</span>
                                <span className="text-red-600">{req.neededAt}</span>
                              </div>
                            </div>

                            {req.details && (
                              <div className="p-3 bg-slate-50/50 rounded-xl text-xs text-slate-500 leading-relaxed font-medium">
                                <span className="font-extrabold text-slate-700 block mb-0.5">রোগীর বিবরণ/অন্যান্য:</span>
                                {req.details}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <a
                                href={`tel:${req.contactNumber}`}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-red-200 flex items-center justify-center gap-1.5 cursor-pointer decoration-none"
                              >
                                <Phone size={14} fill="currentColor" />
                                <span>স্বজনের সাথে কথা বলুন</span>
                              </a>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Blood Donors Directory (Search & Filter) */}
              {activeBloodTab === "donors" && (
                <div className="space-y-6">
                  
                  {/* Filters Block */}
                  <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm space-y-4">
                    <div className="relative">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="রক্তদাতার নাম, গ্রাম বা মোবাইল নম্বর দিয়ে খুঁজুন ভাই..."
                        value={donorSearch || ""}
                        onChange={(e) => setDonorSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Blood Group Filter */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-extrabold text-slate-500 block">রক্তের গ্রুপ ফিল্টার</span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setSelectedGroupFilter("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              selectedGroupFilter === "all"
                                ? "bg-red-600 text-white shadow-md shadow-red-200"
                                : "bg-slate-50 border border-slate-100 text-slate-600 hover:border-red-100"
                            }`}
                          >
                            সব গ্রুপ
                          </button>
                          {BLOOD_GROUPS.map(g => (
                            <button
                              key={g}
                              onClick={() => setSelectedGroupFilter(g)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                selectedGroupFilter === g
                                  ? "bg-red-600 text-white shadow-md shadow-red-200"
                                  : "bg-slate-50 border border-slate-100 text-slate-600 hover:border-red-100"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Union Filter */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-extrabold text-slate-500 block">ইউনিয়ন/এলাকা ফিল্টার</span>
                        <select
                          value={selectedUnionFilter || ""}
                          onChange={(e) => setSelectedUnionFilter(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold"
                        >
                          <option value="all">সকল ইউনিয়ন</option>
                          {UNIONS.map(u => (
                            <option key={u} value={u || ""}>{u}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Donors List Output */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-md font-black text-slate-800">রক্তদাতা তালিকা ({filteredDonors.length} জন)</h3>
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <ShieldCheck size={12} className="fill-current text-white" />
                        সক্রিয় রক্তদাতা
                      </span>
                    </div>

                    {donorsLoading ? (
                      <div className="bg-white border border-slate-100 rounded-[24px] p-12 text-center flex flex-col items-center justify-center">
                        <Loader2 size={32} className="text-red-500 animate-spin mb-3" />
                        <p className="text-xs font-bold text-slate-500">রক্তদাতাদের তালিকা লোড হচ্ছে ভাই...</p>
                      </div>
                    ) : filteredDonors.length === 0 ? (
                      <div className="bg-white border border-slate-100 rounded-[32px] p-12 text-center max-w-md mx-auto shadow-sm">
                        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl animate-pulse">
                          ❤️
                        </div>
                        <h4 className="text-lg font-black text-slate-800 mb-2">কোনো রক্তদাতা পাওয়া যায়নি</h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed mb-6">
                          দুঃখিত ভাই, আপনার নির্বাচিত ফিল্টার বা খোঁজা শব্দানুযায়ী কোনো রক্তদাতা ডেটাবেসে পাওয়া যায়নি। অন্যভাবে চেষ্টা করুন অথবা নতুন ডোনার যুক্ত করুন।
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <button
                            onClick={() => {
                              setDonorSearch("");
                              setSelectedGroupFilter("all");
                              setSelectedUnionFilter("all");
                            }}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-full transition-all cursor-pointer"
                          >
                            অনুসন্ধান রিসেট করুন
                          </button>
                          <button
                            onClick={() => setActiveBloodTab("register")}
                            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-full transition-all cursor-pointer shadow-sm shadow-red-600/10"
                          >
                            রক্তদাতা হোন
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDonors.map((donor, idx) => (
                          <motion.div
                            key={donor.id || idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-md font-black shrink-0 border border-red-100">
                                  {donor.bloodGroup}
                                </div>
                                <div>
                                  <h4 className="text-sm font-black text-slate-800 leading-tight">{donor.name}</h4>
                                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5 mt-1">
                                    <MapPin size={10} />
                                    <span>{donor.village}, {donor.union}</span>
                                  </p>
                                </div>
                              </div>

                              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                রেডি ডোনার
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                              <span>🕒 শেষ রক্তদান:</span>
                              <span className="text-slate-800 font-extrabold">{donor.lastDonated || "১ম বার রক্তদান"}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <a
                                href={`tel:${donor.phone}`}
                                className="bg-red-600 hover:bg-red-700 text-white text-center py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer decoration-none shadow-sm shadow-red-200"
                              >
                                <Phone size={12} fill="currentColor" />
                                <span>কল করুন</span>
                              </a>
                              <a
                                href={`https://api.whatsapp.com/send?phone=${donor.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-center py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer border border-emerald-100 decoration-none"
                              >
                                💬 হোয়াটসঅ্যাপ
                              </a>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Register as voluntary blood donor */}
              {activeBloodTab === "register" && (
                <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-[24px] p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
                  
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <UserPlus size={22} className="text-red-500" />
                      <span>রক্তদাতা হিসেবে নিবন্ধন</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">
                      আপনার রক্তের এক ব্যাগ বাঁচাবে একটি মুমূর্ষু মানুষের জীবন। স্বেচ্ছায় রক্তদাতা হিসেবে আজই আপনার নাম তালিকাভুক্ত করুন।
                    </p>
                  </div>

                  {donorSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl text-xs font-bold flex items-center gap-2 text-center"
                    >
                      <CheckCircle2 size={16} className="mx-auto" />
                      <span>ধন্যবাদ ভাই! রক্তদাতা হিসেবে আপনার নিবন্ধন সফলভাবে সম্পন্ন হয়েছে।</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleRegisterDonor} className="space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-600 block">১. রক্তদাতার সম্পূর্ণ নাম *</label>
                      <input
                        type="text"
                        required
                        placeholder="উদাঃ মোঃ আরিফুল ইসলাম"
                        value={regName || ""}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-600 block">২. রক্তের গ্রুপ *</label>
                        <select
                          value={regGroup || ""}
                          onChange={(e) => setRegGroup(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold text-red-600"
                        >
                          {BLOOD_GROUPS.map(g => (
                            <option key={g} value={g || ""}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-600 block">৩. মোবাইল নম্বর *</label>
                        <input
                          type="tel"
                          required
                          maxLength={11}
                          placeholder="উদাঃ 01700000000"
                          value={regPhone || ""}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-600 block">৪. ইউনিয়ন নির্বাচন করুন *</label>
                        <select
                          value={regUnion || ""}
                          onChange={(e) => setRegUnion(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold"
                        >
                          {UNIONS.map(u => (
                            <option key={u} value={u || ""}>{u}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-600 block">৫. গ্রাম বা মহল্লার নাম *</label>
                        <input
                          type="text"
                          required
                          placeholder="উদাঃ গোপালপুর গ্রাম"
                          value={regVillage || ""}
                          onChange={(e) => setRegVillage(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-600 block">৬. শেষ রক্তদানের তারিখ (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        placeholder="উদাঃ ৩ মাস আগে, জানুয়ারি ২০২৬ বা ১ম বার"
                        value={regLastDonated || ""}
                        onChange={(e) => setRegLastDonated(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={regIsAgreed}
                          onChange={(e) => setRegIsAgreed(e.target.checked)}
                          className="rounded text-red-600 accent-red-600 mt-0.5 cursor-pointer h-4 w-4 shrink-0"
                        />
                        <span className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          আমি শপথ করছি যে রক্তদানের সকল নিয়মানুযায়ী আমি একজন শারীরিক ও মানসিকভাবে সুস্থ ব্যক্তি। মানবতার কল্যাণে যেকোনো প্রয়োজনে আমার সাথে স্বজনদের যোগাযোগ করার অনুমোদন প্রদান করছি।
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isRegisteringDonor}
                      className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-red-200 flex items-center justify-center gap-2 border-none cursor-pointer"
                    >
                      {isRegisteringDonor ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>নিবন্ধন সম্পন্ন হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>রক্তদাতা হিসেবে নিবন্ধন সম্পন্ন করুন</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : type === "transport" ? (
            <div className="space-y-6 text-left">
              
              {/* Transport Cover Banner */}
              <div className="bg-gradient-to-br from-orange-600 to-amber-800 text-white p-6 sm:p-10 rounded-[32px] relative overflow-hidden shadow-md shadow-orange-950/10 border border-orange-500/10">
                <div className="absolute right-0 bottom-0 w-64 h-64 text-white/5 -mb-16 -mr-16">
                  <Bus size={256} className="fill-current" />
                </div>
                <div className="relative z-10 max-w-2xl space-y-4">
                  <span className="bg-white/10 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
                    🚍 নিরাপদ ও সাশ্রয়ী পুঠিয়া যাতায়াত গাইড
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-none text-white">
                    রাজশাহী-পুঠিয়া-ঢাকা রুটসহ সকল যাতায়াত তথ্য!
                  </h2>
                  <p className="text-orange-50 text-xs sm:text-sm font-medium leading-relaxed">
                    পুঠিয়া উপজেলা থেকে ছেড়ে যাওয়া বিভিন্ন বাস ও নিকটবর্তী আব্দুলপুর ও রাজশাহী রেল স্টেশনের ট্রেনের সময়সূচী, টিকেট বুকিং নম্বর এবং লোকাল অটো/সিএনজির নির্ধারিত ভাড়া তালিকা এক নজরে দেখে নিন ভাই।
                  </p>
                </div>
              </div>

              {/* Navigation Tabs Menu */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                <button
                  onClick={() => { setActiveTransportTab("bus"); setTransportSearch(""); }}
                  className={`py-3.5 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border-none cursor-pointer ${
                    activeTransportTab === "bus"
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                      : "text-slate-600 bg-transparent hover:bg-slate-50"
                  }`}
                >
                  <Bus size={18} />
                  <span>বাস সময়সূচী ও কাউন্টার</span>
                </button>
                <button
                  onClick={() => { setActiveTransportTab("train"); setTransportSearch(""); }}
                  className={`py-3.5 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border-none cursor-pointer ${
                    activeTransportTab === "train"
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                      : "text-slate-600 bg-transparent hover:bg-slate-50"
                  }`}
                >
                  <Train size={18} />
                  <span>রেলওয়ে সময়সূচী</span>
                </button>
                <button
                  onClick={() => { setActiveTransportTab("fare"); setTransportSearch(""); }}
                  className={`py-3.5 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border-none cursor-pointer ${
                    activeTransportTab === "fare"
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                      : "text-slate-600 bg-transparent hover:bg-slate-50"
                  }`}
                >
                  <Clock size={18} />
                  <span>লোকাল ভাড়া তালিকা</span>
                </button>
              </div>

              {/* Search Filtering Bar */}
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    activeTransportTab === "bus" 
                      ? "বাসের নাম বা গন্তব্য দিয়ে খুঁজুন ভাই..." 
                      : activeTransportTab === "train" 
                        ? "ট্রেনের নাম বা রুট দিয়ে খুঁজুন..." 
                        : "কোথা থেকে বা কোথায় যাবেন দিয়ে খুঁজুন..."
                  }
                  value={transportSearch || ""}
                  onChange={(e) => setTransportSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-xs font-bold transition-all shadow-sm"
                />
              </div>

              {/* Sub-tab 1: Bus Schedules */}
              {activeTransportTab === "bus" && (
                <div className="space-y-6">
                  {/* Bus routes tab filter */}
                  <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl max-w-md">
                    <button
                      onClick={() => setBusRouteFilter("all")}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer ${
                        busRouteFilter === "all" ? "bg-white text-slate-800 shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      সব রুট
                    </button>
                    <button
                      onClick={() => setBusRouteFilter("ঢাকা")}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer ${
                        busRouteFilter === "ঢাকা" ? "bg-white text-slate-800 shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      ঢাকা রুট
                    </button>
                    <button
                      onClick={() => setBusRouteFilter("লোকাল")}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer ${
                        busRouteFilter === "লোকাল" ? "bg-white text-slate-800 shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      লোকাল সার্ভিস
                    </button>
                  </div>

                  {/* List of buses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(buses.length > 0 ? buses : BUS_SCHEDULES).filter(bus => {
                      const matchesSearch = bus.operator.toLowerCase().includes(transportSearch.toLowerCase()) || 
                                            bus.route.toLowerCase().includes(transportSearch.toLowerCase());
                      const matchesRoute = busRouteFilter === "all" || 
                                           (busRouteFilter === "ঢাকা" && bus.route.includes("ঢাকা")) ||
                                           (busRouteFilter === "লোকাল" && bus.route.includes("লোকাল"));
                      return matchesSearch && matchesRoute;
                    }).map((bus) => (
                      <motion.div
                        key={bus.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5 text-left relative overflow-hidden"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                            <div>
                              <h3 className="text-md font-black text-slate-800 leading-tight">{bus.operator}</h3>
                              <span className="inline-block mt-1 bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                {bus.type}
                              </span>
                            </div>
                            <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0 text-orange-500 border border-orange-100/50">
                              <Bus size={20} />
                            </div>
                          </div>

                          <div className="space-y-2.5 text-xs font-bold text-slate-600">
                            <div className="flex items-start gap-2.5">
                              <span className="text-slate-400 shrink-0">📍 রুট:</span>
                              <span className="text-slate-800">{bus.route}</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <span className="text-slate-400 shrink-0">🕒 সময়সূচী:</span>
                              <span className="text-slate-800 leading-relaxed">{bus.timing}</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <span className="text-slate-400 shrink-0">💵 টিকিট ভাড়া:</span>
                              <span className="text-slate-800 font-extrabold">{bus.ticketPrice}</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <span className="text-slate-400 shrink-0">🗺️ বোর্ডিং ইস্টার:</span>
                              <span className="text-slate-800 font-medium">{bus.boarding}</span>
                            </div>
                          </div>
                        </div>

                        {/* Ticket counters and actions */}
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                          <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">
                            পুঠিয়া ও বানেশ্বর বুকিং কাউন্টার নম্বর:
                          </span>
                          <div className="grid grid-cols-1 gap-2">
                            {bus.counters.map((counter, cIdx) => (
                              <div 
                                key={cIdx}
                                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                              >
                                <span className="text-[11px] font-bold text-slate-600">{counter.name}</span>
                                {counter.phone !== "N/A" ? (
                                  <a
                                    href={`tel:${counter.phone}`}
                                    className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[10px] font-black flex items-center gap-1 transition-all decoration-none shrink-0"
                                  >
                                    <Phone size={10} fill="currentColor" />
                                    <span>{counter.phone}</span>
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-bold px-2 py-1">কাউন্টার নেই</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Train Schedules */}
              {activeTransportTab === "train" && (
                <div className="space-y-6">
                  {/* Stations filter tab */}
                  <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl max-w-sm">
                    <button
                      onClick={() => setTrainStationFilter("all")}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer ${
                        trainStationFilter === "all" ? "bg-white text-slate-800 shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      সব স্টেশন
                    </button>
                    <button
                      onClick={() => setTrainStationFilter("রাজশাহী")}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer ${
                        trainStationFilter === "রাজশাহী" ? "bg-white text-slate-800 shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      রাজশাহী স্টেশন
                    </button>
                    <button
                      onClick={() => setTrainStationFilter("আব্দুলপুর")}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer ${
                        trainStationFilter === "আব্দুলপুর" ? "bg-white text-slate-800 shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      আব্দুলপুর জংশন
                    </button>
                  </div>

                  {/* List of trains */}
                  <div className="space-y-4">
                    {(trains.length > 0 ? trains : TRAIN_SCHEDULES).filter(train => {
                      const matchesSearch = train.name.toLowerCase().includes(transportSearch.toLowerCase()) || 
                                            train.route.toLowerCase().includes(transportSearch.toLowerCase());
                      const matchesStation = trainStationFilter === "all" || 
                                             (trainStationFilter === "রাজশাহী" && train.boarding.includes("রাজশাহী")) ||
                                             (trainStationFilter === "আব্দুলপুর" && train.boarding.includes("আব্দুলপুর"));
                      return matchesSearch && matchesStation;
                    }).map((train) => (
                      <motion.div
                        key={train.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                      >
                        <div className="space-y-3 max-w-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
                              <Train size={18} />
                            </div>
                            <div>
                              <h4 className="text-base font-black text-slate-800">{train.name}</h4>
                              <p className="text-[10px] font-extrabold text-orange-600 mt-0.5">
                                🛑 ছুটির দিন: {train.offDay}
                              </p>
                            </div>
                          </div>

                          <div className="text-xs font-bold text-slate-500 leading-relaxed pl-1">
                            <p className="text-slate-700"><span className="text-slate-400">🗺️ রুট:</span> {train.route}</p>
                            <p className="text-slate-700"><span className="text-slate-400">🕒 সময়সূচী:</span> {train.timing}</p>
                            <p className="text-slate-700"><span className="text-slate-400">💵 টিকিট ভাড়া:</span> {train.ticketPrice}</p>
                            <p className="text-slate-400 font-medium mt-1 leading-snug"><span className="text-slate-400">ℹ️ নোট:</span> {train.note}</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-stretch justify-center text-center gap-2 md:min-w-[200px]">
                          <span className="text-[10px] font-black text-slate-400 uppercase block">বাংলাদেশ রেলওয়ে টিকিট গাইড</span>
                          <a
                            href="https://eticket.railway.gov.bd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 decoration-none cursor-pointer border-none"
                          >
                            <Info size={12} />
                            <span>অনলাইন টিকেট বুকিং</span>
                          </a>
                          <span className="text-[9px] text-slate-400 font-medium mt-0.5">যাত্রা শুরুর সর্বোচ্চ ৩ দিন আগে টিকিট অনলাইনে বুক করা যায়।</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Local Fare Rates */}
              {activeTransportTab === "fare" && (
                <div className="space-y-6">
                  
                  {/* Warning/Guideline Box */}
                  <div className="bg-orange-50 border border-orange-100 rounded-3xl p-5 flex items-start gap-4 text-left">
                    <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center shrink-0">
                      <Info size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-orange-950">ভাড়া জালিয়াতি প্রতিরোধ ও জনসচেতনতা গাইড</h4>
                      <p className="text-xs text-orange-800 leading-relaxed font-semibold">
                        পুঠিয়া উপজেলার সকল রুটের সাধারণ সিএনজি, লোকাল অটো, এবং চার্জে চালিত ভ্যানের নির্ধারিত ভাড়া তালিকা নিচে দেওয়া হল ভাই। যাতায়াতের পূর্বে সঠিক ভাড়া জেনে নিন, যাতে কেউ অতিরিক্ত ভাড়া নিয়ে আপনাকে হয়রানি করতে না পারে।
                      </p>
                      <p className="text-[10px] font-bold text-red-600 pt-1">
                        ⚠️ চালক অতিরিক্ত ভাড়া দাবি করলে সরাসরি উপজেলা কমপ্লেক্সের অভিযোগ নম্বরে বা কর্তব্যরত ট্রাফিক পুলিশকে জানান।
                      </p>
                    </div>
                  </div>

                  {/* Fare Cards */}
                  <div className="space-y-4">
                    {LOCAL_FARES.filter(fare => {
                      return fare.from.toLowerCase().includes(transportSearch.toLowerCase()) || 
                             fare.to.toLowerCase().includes(transportSearch.toLowerCase());
                    }).map((fare) => (
                      <motion.div
                        key={fare.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all text-left space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 rounded-xl text-xs font-black">
                              {fare.from}
                            </span>
                            <span className="text-slate-400 font-bold">⇆</span>
                            <span className="bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 rounded-xl text-xs font-black">
                              {fare.to}
                            </span>
                          </div>
                          <span className="text-xs font-black text-slate-400 flex items-center gap-1">
                            🗺️ দূরত্ব: {fare.distance}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                            <span className="text-[10px] text-slate-400 font-extrabold block">🚗 সিএনজি শেয়ার ভাড়া</span>
                            <span className="text-sm font-black text-slate-800">{fare.cngFare}</span>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                            <span className="text-[10px] text-slate-400 font-extrabold block">🛺 অটো শেয়ার ভাড়া (যাত্রী প্রতি)</span>
                            <span className="text-sm font-black text-slate-800">{fare.autoFare}</span>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                            <span className="text-[10px] text-slate-400 font-extrabold block">🔑 অটো রিজার্ভ ভাড়া</span>
                            <span className="text-sm font-black text-orange-600">{fare.reserveAuto}</span>
                          </div>
                        </div>

                        <div className="bg-slate-50/50 p-3 rounded-xl text-[11px] text-slate-500 leading-relaxed font-bold">
                          <span className="text-slate-700 font-black">💡 গুরুত্বপূর্ণ রুট গাইড: </span>
                          {fare.note}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Complaint Contact Block */}
                  <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
                    <h4 className="text-md font-black text-emerald-500">পরিবহন সংক্রান্ত যেকোনো জরুরি অভিযোগ বা সহায়তায়</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      পুঠিয়া উপজেলার অভ্যন্তরে যাতায়াতকালে ভাড়া নিয়ে কোনো বিরূপ পরিস্থিতি বা অসৌজন্যমূলক আচরণের সম্মুখীন হলে নিম্নলিখিত নম্বরে যোগাযোগ করে অভিযোগ নথিভুক্ত করতে পারেন ভাই:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300">পুঠিয়া থানা (ডিউটি অফিসার)</span>
                        <a 
                          href="tel:01713-373373"
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all decoration-none"
                        >
                          <Phone size={12} fill="currentColor" />
                          <span>০১৭১৩-৩৭৩৩৭৩</span>
                        </a>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300">উপজেলা অভিযোগ সেল (২৪/৭)</span>
                        <a 
                          href="tel:01700-000000"
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all decoration-none"
                        >
                          <Phone size={12} fill="currentColor" />
                          <span>০১৭০০-০০০০০০</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : type === "administration" ? (
            <div className="space-y-6">
              <RepresentativesProfile />
            </div>
          ) : type === "history" || type === "tourism" ? (
            <TouristSpots onGoBack={() => navigate(-1)} />
          ) : type === "social" || type === "ngo" ? (
            <NgoSocial onGoBack={() => navigate(-1)} />
          ) : type === "emergency" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setActiveBloodTab("emergency_hospital" as any)}
                  className="p-6 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">হাসপাতাল ও এম্বুলেন্স</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">জরুরি স্বাস্থ্য সেবা</p>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveBloodTab("emergency_police" as any)}
                  className="p-6 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">পুলিশ ও ফায়ার সার্ভিস</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">নিরাপত্তা ও উদ্ধার সেবা</p>
                  </div>
                </button>
              </div>

              {activeBloodTab === ("emergency_hospital" as any) ? (
                <div className="space-y-6">
                  <HospitalInfo onGoBack={() => setActiveBloodTab("requests")} />
                  <AmbulanceInfo onGoBack={() => setActiveBloodTab("requests")} />
                </div>
              ) : activeBloodTab === ("emergency_police" as any) ? (
                <div className="space-y-6">
                  <PoliceInfo onGoBack={() => setActiveBloodTab("requests")} />
                  <FireServiceInfo onGoBack={() => setActiveBloodTab("requests")} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                  <div className="p-8 bg-white border border-slate-100 rounded-[32px] text-center space-y-4">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                      <Phone size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">জাতীয় হেল্পলাইন</h3>
                    <p className="text-xs font-bold text-slate-400">জরুরি প্রয়োজনে সরকারি কল সেন্টার</p>
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <a href="tel:999" className="p-4 bg-red-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-red-200">৯৯৯</a>
                      <a href="tel:333" className="p-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-200">৩৩৩</a>
                      <a href="tel:109" className="p-4 bg-pink-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-pink-200">১০৯</a>
                      <a href="tel:106" className="p-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-200">১০৬</a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : type === "career" ? (
            <CareerGuidelineInfo onGoBack={() => navigate(-1)} />
          ) : type === "agriculture" ? (
            <AgriServiceInfo onGoBack={() => navigate(-1)} category={selectedCategory} />
          ) : type === "education" ? (
            <EduInstInfo onGoBack={() => navigate(-1)} />
          ) : type === "jobs" ? (
            <ServiceDirectoryTemplate serviceKeyParam="job" isEmbedded={true} />
          ) : type === "training" ? (
            <TrainingHub onGoBack={() => navigate(-1)} />
          ) : type === "services" ? (
            <LocalServiceProviderInfo onGoBack={() => navigate(-1)} />
          ) : type === "administration" ? (
            selectedSubView ? (
              selectedSubView === "ds_nid_services" ? (
                <NIDServicesInfo onGoBack={() => setSelectedSubView(null)} />
              ) : selectedSubView === "ds_passport" ? (
                <PassportServices onBack={() => setSelectedSubView(null)} />
              ) : selectedSubView === "ds_land_services" ? (
                <LandServicesInfo onGoBack={() => setSelectedSubView(null)} />
              ) : (
                <UnionServices onGoBack={() => setSelectedSubView(null)} />
              )
            ) : (
              <GovtServicesInfo onGoBack={() => navigate(-1)} setSelectedSubView={setSelectedSubView} />
            )
          ) : type === "finance" ? (
            <BankingFinance onGoBack={() => navigate(-1)} initialCategory={initialCategory} />
          ) : type === "insurance" ? (
            <InsuranceServices onGoBack={() => navigate(-1)} />
          ) : type === "community" ? (
            <CommunityEventsHub onGoBack={() => navigate(-1)} />
          ) : (
            /* Under Construction Fallback for Other Types */
            <div className="bg-emerald-50/30 border border-emerald-100 rounded-[32px] p-12 text-center">
              <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-900/5">
                <Search size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-black text-emerald-950 mb-2">এই বিভাগটি শীঘ্রই আসছে</h2>
              <p className="text-sm font-bold text-gray-400 max-w-sm mx-auto leading-relaxed">
                আমরা পুঠিয়ার সকল ডিজিটাল সেবা এক জায়গায় নিয়ে আসার কাজ করছি। খুব শীঘ্রই এই বিভাগের সকল তথ্য ও সুবিধা এখানে পাওয়া যাবে।
              </p>
              
              <button 
                onClick={() => navigate("/")}
                className="mt-8 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                মূল পাতায় ফিরে যান
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer />
      <BottomNavigation activeTab="" onTabChange={() => {}} />

      {/* Authentication Modal Popup */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default ServicePage;

import React from 'react';
import { 
  Phone, Flame, Ambulance, ShieldAlert, Hospital, Zap, Wind, Droplets,
  HeartPulse, ShieldCheck, PhoneCall, MapPin, ExternalLink, Info, Globe,
  Copy, PhoneOff, Compass
} from 'lucide-react';

export interface EmergencyServiceItem {
  id: string;
  name: string;
  subtitle: string;
  phone: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  textColor: string;
  address: string;
  mapsUrl?: string;
  hours: string;
  badge?: string;
  website?: string;
}

export const emergencyServicesList: EmergencyServiceItem[] = [
  {
    id: "999",
    name: "৯৯৯ (জাতীয় জরুরি সেবা)",
    subtitle: "পুলিশ, ফায়ার সার্ভিস ও অ্যাম্বুলেন্স",
    phone: "999",
    icon: <PhoneCall size={24} />,
    bg: "bg-red-50 hover:bg-red-100",
    border: "border-red-200 hover:border-red-300",
    textColor: "text-red-600",
    address: "ঢাকা, বাংলাদেশ (সারাদেশের জন্য প্রযোজ্য টোল-ফ্রি সেবা)",
    mapsUrl: "https://maps.google.com/?q=National+Emergency+Service+999+Bangladesh",
    hours: "২৪ ঘণ্টা খোলা (প্রতিদিন)",
    badge: "২৪/৭",
    website: "https://999.gov.bd"
  },
  {
    id: "ambulance",
    name: "অ্যাম্বুলেন্স",
    subtitle: "জরুরি রোগী পরিবহন ও অক্সিজেন সেবা",
    phone: "01713222333",
    icon: <Ambulance size={24} />,
    bg: "bg-red-50/80 hover:bg-red-100",
    border: "border-red-100/80 hover:border-red-200",
    textColor: "text-red-500",
    address: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স প্রাঙ্গণ, পুঠিয়া, রাজশাহী",
    mapsUrl: "https://maps.google.com/?q=Puthia+Upazila+Health+Complex",
    hours: "২৪ ঘণ্টা খোলা (প্রতিদিন)",
    website: ""
  },
  {
    id: "police",
    name: "থানা (পুলিশ)",
    subtitle: "পুঠিয়া থানা পুলিশ নিয়ন্ত্রণ কক্ষ",
    phone: "01320122485",
    icon: <ShieldAlert size={24} />,
    bg: "bg-red-50/80 hover:bg-red-100",
    border: "border-red-100/80 hover:border-red-200",
    textColor: "text-blue-600",
    address: "পুঠিয়া থানা রোড, পুঠিয়া সদর, পুঠিয়া, রাজশাহী",
    mapsUrl: "https://maps.google.com/?q=Puthia+Police+Station",
    hours: "২৪ ঘণ্টা খোলা (প্রতিদিন)",
    website: "https://police.rajshahi.gov.bd"
  },
  {
    id: "fire",
    name: "ফায়ার সার্ভিস",
    subtitle: "অগ্নি নির্বাপণ ও উদ্ধারকারী রেসকিউ টিম",
    phone: "01730336655",
    icon: <Flame size={24} />,
    bg: "bg-red-50/80 hover:bg-red-100",
    border: "border-red-100/80 hover:border-red-200",
    textColor: "text-orange-600",
    address: "পুঠিয়া ফায়ার স্টেশন, পুঠিয়া সদর, রাজশাহী",
    mapsUrl: "https://maps.google.com/?q=Puthia+Fire+Station",
    hours: "২৪ ঘণ্টা খোলা (প্রতিদিন)",
    website: "http://www.fireservice.gov.bd"
  },
  {
    id: "hospital",
    name: "হাসপাতাল",
    subtitle: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স",
    phone: "01715182440",
    icon: <Hospital size={24} />,
    bg: "bg-red-50/80 hover:bg-red-100",
    border: "border-red-100/80 hover:border-red-200",
    textColor: "text-emerald-600",
    address: "ঢাকা-রাজশাহী মহাসড়ক, পুঠিয়া সদর, রাজশাহী",
    mapsUrl: "https://maps.google.com/?q=Puthia+Upazila+Health+Complex",
    hours: "২৪ ঘণ্টা খোলা (জরুরি বিভাগ)",
    website: "http://dghs.gov.bd"
  },
  {
    id: "electricity",
    name: "বিদ্যুৎ জরুরি",
    subtitle: "পল্লী বিদ্যুৎ অভিযোগ কেন্দ্র (পুঠিয়া)",
    phone: "01769400122",
    icon: <Zap size={24} />,
    bg: "bg-red-50/80 hover:bg-red-100",
    border: "border-red-100/80 hover:border-red-200",
    textColor: "text-amber-500",
    address: "পল্লী বিদ্যুৎ অফিস, পুঠিয়া সদর, রাজশাহী",
    mapsUrl: "https://maps.google.com/?q=Puthia+Palli+Bidyut+Office",
    hours: "সকাল ৮:০০ - রাত ১০:০০ (অভিযোগ ২৪ ঘণ্টা)",
    website: "http://pbs.rajshahi.gov.bd"
  },
  {
    id: "gas",
    name: "গ্যাস জরুরি",
    subtitle: "পশ্চিমাঞ্চল গ্যাস কোম্পানি লিমিটেড (PGCL)",
    phone: "01711404555",
    icon: <Wind size={24} />,
    bg: "bg-red-50/80 hover:bg-red-100",
    border: "border-red-100/80 hover:border-red-200",
    textColor: "text-teal-600",
    address: "আঞ্চলিক অভিযোগ কেন্দ্র, রাজশাহী",
    mapsUrl: "https://maps.google.com/?q=PGCL+Rajshahi+Office",
    hours: "সকাল ৯:০০ - বিকাল ৫:০০ (জরুরি সেবা ২৪ ঘণ্টা)",
    website: "http://www.pgcl.org.bd"
  },
  {
    id: "water",
    name: "পানি সরবরাহ",
    subtitle: "জনস্বাস্থ্য প্রকৌশল অধিদপ্তর পুঠিয়া",
    phone: "01733088999",
    icon: <Droplets size={24} />,
    bg: "bg-red-50/80 hover:bg-red-100",
    border: "border-red-100/80 hover:border-red-200",
    textColor: "text-blue-500",
    address: "উপজেলা পরিষদ কমপ্লেক্স, পুঠিয়া, রাজশাহী",
    mapsUrl: "https://maps.google.com/?q=Puthia+Upazila+Parishad",
    hours: "সকাল ৯:০০ - বিকাল ৫:০০",
    website: "http://www.dphe.gov.bd"
  },
  {
    id: "child_help",
    name: "শিশু সহায়তা (১০৯৮)",
    subtitle: "চাইল্ড হেল্পলাইন বাংলাদেশ",
    phone: "1098",
    icon: <HeartPulse size={24} />,
    bg: "bg-red-50/80 hover:bg-red-100",
    border: "border-red-100/80 hover:border-red-200",
    textColor: "text-rose-500",
    address: "সমাজসেবা অধিদপ্তর, ঢাকা (টোল-ফ্রি কল)",
    hours: "২৪ ঘণ্টা খোলা (প্রতিদিন)",
    website: "https://1098.gov.bd"
  },
  {
    id: "women_help",
    name: "নারী ও শিশু নির্যাতন হেল্পলাইন (১০৯)",
    subtitle: "জাতীয় নারী ও শিশু নির্যাতন প্রতিরোধ সেল",
    phone: "109",
    icon: <ShieldCheck size={24} />,
    bg: "bg-red-50/80 hover:bg-red-100",
    border: "border-red-100/80 hover:border-red-200",
    textColor: "text-purple-600",
    address: "মহিলা ও শিশু বিষয়ক মন্ত্রণালয়, ঢাকা",
    hours: "২৪ ঘণ্টা খোলা (টোল-ফ্রি কল)",
    website: "https://mowca.gov.bd"
  },
  {
    id: "disaster_help",
    name: "দুর্যোগ হটলাইন (১০৯০)",
    subtitle: "দুর্যোগের আগাম বার্তা ও তথ্য কেন্দ্র",
    phone: "1090",
    icon: <Info size={24} />,
    bg: "bg-red-50/80 hover:bg-red-100",
    border: "border-red-100/80 hover:border-red-200",
    textColor: "text-orange-500",
    address: "দুর্যোগ ব্যবস্থাপনা ও ত্রাণ মন্ত্রণালয়, ঢাকা",
    hours: "২৪ ঘণ্টা খোলা (টোল-ফ্রি কল)",
    website: "https://modmr.gov.bd"
  },
  {
    id: "blood_donors",
    name: "রক্তদাতা খুঁজুন",
    subtitle: "জরুরি রক্তদান ও সন্ধান কেন্দ্র",
    phone: "01700112233",
    icon: <Droplets size={24} />,
    bg: "bg-red-50/80 hover:bg-red-100",
    border: "border-red-100/80 hover:border-red-200",
    textColor: "text-red-600",
    address: "রাজশাহী মেডিকেল কলেজ শাখা ও স্থানীয় স্বেচ্ছাসেবক নেটওয়ার্ক",
    mapsUrl: "https://maps.google.com/?q=Rajshahi+Medical+College+Hospital",
    hours: "২৪ ঘণ্টা খোলা",
    website: "https://blood.quantummethod.org.bd"
  }
];

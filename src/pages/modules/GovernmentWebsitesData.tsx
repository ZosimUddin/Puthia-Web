import React from 'react';
import { 
  Globe, User, FileText, Plane, Map, Car, Bus, Train, 
  MapPin, CheckSquare, Coins, Receipt, Briefcase, FileCheck, 
  ShieldAlert, Flame, PhoneCall, Stethoscope, Activity, 
  GraduationCap, BookOpen, Users, Landmark
} from 'lucide-react';

export const governmentWebsites = [
  {
    title: "জাতীয় সেবা",
    icon: <Landmark size={20} className="text-emerald-600" />,
    color: "bg-emerald-50 border-emerald-100",
    items: [
      { name: "বাংলাদেশ জাতীয় তথ্য বাতায়ন", subtitle: "সকল সরকারি তথ্যের কেন্দ্র", icon: <Globe size={16} />, path: "https://bangladesh.gov.bd" },
      { name: "বাংলাদেশ সরকার", subtitle: "অফিসিয়াল ওয়েব পোর্টাল", icon: <Landmark size={16} />, path: "https://bangladesh.gov.bd" },
      { name: "মাইগভ (myGov)", subtitle: "ডিজিটাল সরকারি সেবা", icon: <Globe size={16} />, path: "https://www.mygov.bd/" },
      { name: "বাংলাদেশ ই-গভর্নমেন্ট", subtitle: "ই-সেবা ও তথ্য", icon: <Globe size={16} />, path: "https://bcc.gov.bd/" },
    ]
  },
  {
    title: "নাগরিক সেবা",
    icon: <User size={20} className="text-blue-600" />,
    color: "bg-blue-50 border-blue-100",
    items: [
      { name: "NID", subtitle: "জাতীয় পরিচয়পত্র সেবা", icon: <User size={16} />, path: "https://services.nidw.gov.bd/nid-pub/" },
      { name: "জন্ম ও মৃত্যু নিবন্ধন", subtitle: "অনলাইন নিবন্ধন", icon: <FileText size={16} />, path: "https://bdris.gov.bd/" },
      { name: "e-Passport", subtitle: "অনলাইন পাসপোর্ট আবেদন", icon: <Plane size={16} />, path: "https://www.epassport.gov.bd/" },
      { name: "ভিসা তথ্য", subtitle: "অনলাইন ভিসা চেকিং", icon: <Globe size={16} />, path: "https://www.visa.gov.bd/" },
    ]
  },
  {
    title: "পরিবহন",
    icon: <Car size={20} className="text-orange-600" />,
    color: "bg-orange-50 border-orange-100",
    items: [
      { name: "BRTA", subtitle: "ড্রাইভিং লাইসেন্স ও যানবাহন", icon: <Car size={16} />, path: "http://www.brta.gov.bd/" },
      { name: "বিআইডব্লিউটিএ", subtitle: "নৌ-পরিবহন সেবা", icon: <Globe size={16} />, path: "http://www.biwta.gov.bd/" },
      { name: "বিআরটিসি", subtitle: "সরকারি পরিবহন সেবা", icon: <Bus size={16} />, path: "http://www.brtc.gov.bd/" },
      { name: "বাংলাদেশ রেলওয়ে", subtitle: "ট্রেন টিকিট ও তথ্য", icon: <Train size={16} />, path: "https://railway.gov.bd/" },
    ]
  },
  {
    title: "প্রশাসন",
    icon: <MapPin size={20} className="text-indigo-600" />,
    color: "bg-indigo-50 border-indigo-100",
    items: [
      { name: "রাজশাহী জেলা", subtitle: "জেলা প্রশাসন", icon: <MapPin size={16} />, path: "http://www.rajshahi.gov.bd/" },
      { name: "পুঠিয়া উপজেলা", subtitle: "উপজেলা প্রশাসন", icon: <MapPin size={16} />, path: "http://puthia.rajshahi.gov.bd/" },
      { name: "রাজশাহী বিভাগ", subtitle: "বিভাগীয় কমিশনার", icon: <MapPin size={16} />, path: "http://www.rajshahidiv.gov.bd/" },
      { name: "নির্বাচন কমিশন", subtitle: "নির্বাচনী তথ্য ও সেবা", icon: <CheckSquare size={16} />, path: "http://www.ecs.gov.bd/" },
    ]
  },
  {
    title: "কৃষি ও ভূমি",
    icon: <Map size={20} className="text-amber-600" />,
    color: "bg-amber-50 border-amber-100",
    items: [
      { name: "ভূমি মন্ত্রণালয়", subtitle: "ভূমি সংক্রান্ত সেবা", icon: <Map size={16} />, path: "https://minland.gov.bd/" },
      { name: "ই-নামজারি", subtitle: "অনলাইন নামজারি", icon: <FileText size={16} />, path: "https://mutation.land.gov.bd/" },
      { name: "ই-পর্চা", subtitle: "খতিয়ান ও পর্চা", icon: <FileText size={16} />, path: "https://eporcha.gov.bd/" },
      { name: "কৃষি তথ্য সার্ভিস", subtitle: "কৃষি বিষয়ক পরামর্শ", icon: <BookOpen size={16} />, path: "http://www.ais.gov.bd/" },
    ]
  },
  {
    title: "কর ও ব্যবসা",
    icon: <Coins size={20} className="text-teal-600" />,
    color: "bg-teal-50 border-teal-100",
    items: [
      { name: "জাতীয় রাজস্ব বোর্ড (NBR)", subtitle: "আয়কর ও শুল্ক", icon: <Landmark size={16} />, path: "https://nbr.gov.bd/" },
      { name: "e-TIN", subtitle: "অনলাইন টিআইএন নিবন্ধন", icon: <FileCheck size={16} />, path: "https://incometax.gov.bd/" },
      { name: "VAT Online", subtitle: "ভ্যাট সংক্রান্ত সেবা", icon: <Receipt size={16} />, path: "https://vat.gov.bd/" },
      { name: "RJSC", subtitle: "যৌথ মূলধন কোম্পানি", icon: <Briefcase size={16} />, path: "http://www.roc.gov.bd/" },
    ]
  },
  {
    title: "আইন ও নিরাপত্তা",
    icon: <ShieldAlert size={20} className="text-red-600" />,
    color: "bg-red-50 border-red-100",
    items: [
      { name: "বাংলাদেশ পুলিশ", subtitle: "পুলিশ সেবা", icon: <ShieldAlert size={16} />, path: "https://www.police.gov.bd/" },
      { name: "পুলিশ ক্লিয়ারেন্স", subtitle: "সার্টিফিকেট আবেদন", icon: <FileCheck size={16} />, path: "https://pcc.police.gov.bd/" },
      { name: "ফায়ার সার্ভিস", subtitle: "অগ্নি নির্বাপণ ও উদ্ধার", icon: <Flame size={16} />, path: "http://www.fireservice.gov.bd/" },
      { name: "জাতীয় জরুরি সেবা (৯৯৯)", subtitle: "জরুরি সহায়তা", icon: <PhoneCall size={16} />, path: "https://999.gov.bd/" },
    ]
  },
  {
    title: "স্বাস্থ্য",
    icon: <Stethoscope size={20} className="text-pink-600" />,
    color: "bg-pink-50 border-pink-100",
    items: [
      { name: "স্বাস্থ্য অধিদপ্তর", subtitle: "স্বাস্থ্য ও চিকিৎসা সেবা", icon: <Stethoscope size={16} />, path: "https://dghs.gov.bd/" },
      { name: "করোনা/টিকা তথ্য", subtitle: "সুরক্ষা পোর্টাল", icon: <Activity size={16} />, path: "https://surokkha.gov.bd/" },
      { name: "ঔষধ প্রশাসন অধিদপ্তর", subtitle: "ওষুধ সংক্রান্ত তথ্য", icon: <BookOpen size={16} />, path: "http://www.dgda.gov.bd/" },
    ]
  },
  {
    title: "শিক্ষা",
    icon: <GraduationCap size={20} className="text-purple-600" />,
    color: "bg-purple-50 border-purple-100",
    items: [
      { name: "শিক্ষা মন্ত্রণালয়", subtitle: "শিক্ষা সংক্রান্ত তথ্য", icon: <GraduationCap size={16} />, path: "http://www.moedu.gov.bd/" },
      { name: "মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর", subtitle: "মাউশি", icon: <BookOpen size={16} />, path: "http://www.dshe.gov.bd/" },
      { name: "জাতীয় বিশ্ববিদ্যালয়", subtitle: "National University", icon: <Users size={16} />, path: "http://www.nu.ac.bd/" },
      { name: "কারিগরি শিক্ষা বোর্ড", subtitle: "BTEB", icon: <BookOpen size={16} />, path: "http://www.bteb.gov.bd/" },
    ]
  }
];

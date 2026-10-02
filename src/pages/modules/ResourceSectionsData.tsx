import React from 'react';
import { 
  FileText, Bookmark, Download, ExternalLink, 
  Landmark, Map, Sprout, Users, BookOpen, ShieldCheck, Lightbulb,
  ChevronRight, Headset, FolderSearch, Star, AlertCircle, RefreshCw, User, Plane, Car, Shield, Briefcase, FileCheck, PhoneCall, Phone, Flame, Ambulance, Hospital, ShieldAlert, Coins, Receipt, Building, Smartphone, Home, Edit, Cloud, GraduationCap, Award, Gift, Zap, Calculator, ArrowRightLeft, Calendar, Activity, CreditCard, BookmarkPlus, Globe, CheckSquare, Search, ArrowLeft, X, MapPin, School,
  Clock, TrendingUp, Sparkles, Pin, Bell, Megaphone, Info, Settings, Stethoscope, Store, UserCheck, MessageSquare, PlayCircle, HelpCircle, UserPlus, FileSignature, AlertTriangle, FileArchive, Layers
} from 'lucide-react';

export const resourceSections = [

  {
    title: "ব্যবহারকারী সুবিধা",
    icon: <UserCheck size={20} className="text-blue-600" />,
    color: "bg-blue-50 border-blue-100",
    items: [
      { name: "আমার আবেদন", icon: <FileSignature size={16} />, path: "/my-applications" },
      { name: "আমার ডাউনলোড", icon: <FileArchive size={16} />, path: "/my-downloads" },
      { name: "আমার বুকমার্ক", icon: <Bookmark size={16} />, path: "/favorites" },
      { name: "আমার অভিযোগ", icon: <AlertTriangle size={16} />, path: "/my-complaints" },
      { name: "আমার রিভিউ", icon: <Star size={16} />, path: "/my-reviews" },
    ]
  },


  {
    title: "নাগরিক সেবা",
    icon: <Users size={20} className="text-blue-600" />,
    color: "bg-blue-50 border-blue-100",
    items: [
      { name: "জন্ম নিবন্ধন", icon: <FileText size={16} />, path: "/services/birth-reg" },
      { name: "জাতীয় পরিচয়পত্র (NID)", icon: <User size={16} />, path: "/services/nid" },
      { name: "পাসপোর্ট", icon: <Plane size={16} />, path: "/services/passport" },
      { name: "ড্রাইভিং লাইসেন্স", icon: <Car size={16} />, path: "/services/driving-license" },
      { name: "পুলিশ ক্লিয়ারেন্স", icon: <Shield size={16} />, path: "/services/police-clearance" },
      { name: "ট্রেড লাইসেন্স", icon: <Briefcase size={16} />, path: "/services/trade-license" },
      { name: "ই-টিন", icon: <FileCheck size={16} />, path: "/services/etin" },
      { name: "ভূমি সেবা", icon: <Map size={16} />, path: "/services/land" },
    ]
  },
  {
    title: "আবেদন ও ডাউনলোড",
    icon: <Download size={20} className="text-orange-600" />,
    color: "bg-orange-50 border-orange-100",
    items: [
      { name: "আবেদন ফরম", icon: <FileText size={16} />, path: "/downloads/forms" },
      { name: "সরকারি PDF", icon: <FileText size={16} />, path: "/downloads/pdf" },
      { name: "নির্দেশিকা", icon: <BookOpen size={16} />, path: "/downloads/guidelines" },
      { name: "নমুনা ফরম", icon: <FileText size={16} />, path: "/downloads/samples" },
    ]
  },
  {
    title: "কর ও আর্থিক সেবা",
    icon: <Coins size={20} className="text-purple-600" />,
    color: "bg-purple-50 border-purple-100",
    items: [
      { name: "আয়কর", icon: <FileText size={16} />, path: "/finance/tax" },
      { name: "VAT", icon: <Receipt size={16} />, path: "/finance/vat" },
      { name: "ব্যাংক", icon: <Building size={16} />, path: "/finance/bank" },
      { name: "মোবাইল ব্যাংকিং", icon: <Smartphone size={16} />, path: "/finance/mobile-banking" },
    ]
  },
  {
    title: "ভূমি ও সম্পত্তি",
    icon: <Home size={20} className="text-amber-600" />,
    color: "bg-amber-50 border-amber-100",
    items: [
      { name: "খতিয়ান", icon: <FileText size={16} />, path: "/land/khatian" },
      { name: "মৌজা ম্যাপ", icon: <Map size={16} />, path: "/land/mouza" },
      { name: "নামজারি", icon: <Edit size={16} />, path: "/land/namjari" },
      { name: "ভূমি উন্নয়ন কর", icon: <Coins size={16} />, path: "/land/tax" },
    ]
  },
  {
    title: "শিক্ষা",
    icon: <GraduationCap size={20} className="text-indigo-600" />,
    color: "bg-indigo-50 border-indigo-100",
    items: [
      { name: "SSC/HSC ফলাফল", icon: <Award size={16} />, path: "/education/results" },
      { name: "ভর্তি", icon: <Users size={16} />, path: "/education/admission" },
      { name: "বৃত্তি", icon: <Gift size={16} />, path: "/education/scholarship" },
      { name: "শিক্ষা বোর্ড", icon: <Landmark size={16} />, path: "/education/board" },
      { name: "বই (NCTB)", icon: <BookOpen size={16} />, path: "/education/books" },
      { name: "ই-বুক ও নোট", icon: <FileText size={16} />, path: "/education/ebooks" },
      { name: "স্কুল ও কলেজ তালিকা", icon: <School size={16} />, path: "/education/schools-colleges" },
      { name: "বিশ্ববিদ্যালয় তালিকা", icon: <Building size={16} />, path: "/education/universities" },
      { name: "শিক্ষক নিবন্ধন (NTRCA)", icon: <UserCheck size={16} />, path: "/education/ntrca-exam" },
      { name: "পরীক্ষার রুটিন", icon: <Calendar size={16} />, path: "/education/exam-routine" },
      { name: "শিক্ষা নোটিশ", icon: <Megaphone size={16} />, path: "/education/notices" },
      { name: "অনলাইন ক্লাস", icon: <PlayCircle size={16} />, path: "/education/online-classes" },
      { name: "অলিম্পিয়াড/প্রতিযোগিতা", icon: <Award size={16} />, path: "/education/competitions" },
      { name: "শিক্ষা FAQ", icon: <HelpCircle size={16} />, path: "/education/faq" },
    ]
  },
  {
    title: "অন্যান্য",
    icon: <Globe size={20} className="text-slate-600" />,
    color: "bg-slate-50 border-slate-100",
    items: [
      { name: "সরকারি মোবাইল অ্যাপ", icon: <Smartphone size={16} />, path: "/support-center?tab=apps" },
      { name: "ভিডিও গাইড", icon: <PlayCircle size={16} />, path: "/support-center?tab=video" },
      { name: "FAQ", icon: <HelpCircle size={16} />, path: "/support-center?tab=faq" },
      { name: "যোগাযোগ", icon: <Phone size={16} />, path: "/support-center?tab=contact" },
    ]
  }
];

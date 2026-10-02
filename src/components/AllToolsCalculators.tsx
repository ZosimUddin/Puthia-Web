import React, { useState, useEffect, useRef } from 'react';
import { copyToClipboard } from '../utils/clipboard';
import { 
  Calculator, Scale, Droplet, Sun, Wind, CloudRain, 
  MapPin, Clock, ArrowLeft, Ruler, LandPlot, Map, Building, Pickaxe, PaintBucket,
  X, Search, Filter, LayoutGrid, Leaf, Sprout, Building2, Flame, ChevronRight, Star,
  TrendingUp, Percent, Gauge, Calendar, ArrowRightLeft, Wrench, Package, Landmark,
  Compass, Moon, Gift, Users, Heart, Activity,
  GraduationCap, Timer, BookOpen, Award, Trash2, Plus, Play, Pause, RotateCcw,
  Briefcase, Coins, Receipt, Layers, LineChart, FileText, ArrowUpRight,
  QrCode, Barcode, Key, ShieldAlert, Shuffle, Palette, Fingerprint, Type,
  Scissors, Eye, FileImage, Thermometer, Database, Zap, RefreshCw, Megaphone
} from 'lucide-react';

import { FavoriteButton } from './FavoriteButton';
import { ShareButton } from './ShareButton';
import { ToolFeedbackFooter } from './ToolFeedbackFooter';
import { ToolExtraInfo } from './ToolExtraInfo';

import {
  ProfitMarginCalculator,
  GSTVATCalculator,
  InvoiceCalculator,
  StockCalculator,
  ROICalculator,
  BreakEvenCalculator
} from './BusinessCalculators';

import {
  BirthdayCountdown,
  AnniversaryCountdown,
  FamilyBudgetPlanner
} from './FamilyCalculators';

import {
  QRCodeGenerator,
  BarcodeGenerator,
  PasswordUtility,
  RandomNumberGenerator,
  ColorUtility,
  UUIDGenerator,
  TextCounterUtility
} from './SmartUtilities';

import DigitalTools from './DigitalTools';
import { Laptop } from 'lucide-react';
import ToolRequestSection from './ToolRequestSection';

interface AllToolsCalculatorsProps {
  onGoBack: () => void;
}

export function AllToolsCalculators({ onGoBack }: AllToolsCalculatorsProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const tools = [
    {
      id: 'land',
      title: 'জমির ক্ষেত্রফল',
      description: 'দৈর্ঘ্য ও প্রস্থ দিয়ে জমির নিখুঁত পরিমাপ ও শতক-কাঠা হিসাব',
      icon: <Ruler className="w-7 h-7 text-[#009664]" strokeWidth={2} />,
      bg: 'bg-emerald-50',
      category: 'land',
      badge: '🔥 জনপ্রিয়',
      isOffline: true
    },
    {
      id: 'brick',
      title: 'ইট হিসাব',
      description: 'দেয়ালের মাপ অনুযায়ী মোট ইটের সংখ্যা, সিমেন্ট, বালু ও আনুমানিক খরচ',
      icon: <Building2 className="w-7 h-7 text-[#f97316]" strokeWidth={2} />,
      bg: 'bg-orange-50',
      category: 'construction',
      isOffline: true
    },
    {
      id: 'cement',
      title: 'সিমেন্ট হিসাব',
      description: 'গাঁথুনি, প্লাস্টার বা ঢালাইয়ের জন্য প্রয়োজনীয় সিমেন্টের বস্তার হিসাব',
      icon: <Package className="w-7 h-7 text-[#3b82f6]" strokeWidth={2} />,
      bg: 'bg-blue-50',
      category: 'construction',
      isOffline: true
    },
    {
      id: 'sand',
      title: 'বালু হিসাব',
      description: 'নির্মাণ কাজে প্রয়োজনীয় বালির পরিমাণ (CFT) ও ট্রাক লোডের হিসাব',
      icon: <Pickaxe className="w-7 h-7 text-[#f59e0b]" strokeWidth={2} />,
      bg: 'bg-amber-50',
      category: 'construction',
      isOffline: true
    },
    {
      id: 'tiles',
      title: 'টাইলস হিসাব',
      description: 'মেঝে বা দেয়ালের ক্ষেত্রফল অনুযায়ী টাইলস সংখ্যা ও আনুমানিক খরচ',
      icon: <LayoutGrid className="w-7 h-7 text-[#14b8a6]" strokeWidth={2} />,
      bg: 'bg-teal-50',
      category: 'construction',
      badge: '⭐ সুপারিশকৃত',
      isOffline: true
    },
    {
      id: 'paint',
      title: 'রঙ (Paint) হিসাব',
      description: 'দেয়ালের ক্ষেত্রফল ও কোটের সংখ্যা অনুযায়ী রঙের পরিমাণ ও খরচ',
      icon: <PaintBucket className="w-7 h-7 text-[#eab308]" strokeWidth={2} />,
      bg: 'bg-yellow-50',
      category: 'construction'
    },
    {
      id: 'rod',
      title: 'রড হিসাব',
      description: 'রডের মিলিমিটার ব্যাস ও মোট দৈর্ঘ্য অনুযায়ী নিখুঁত ওজন (কেজি ও টন)',
      icon: <TrendingUp className="w-7 h-7 text-[#3b82f6]" strokeWidth={2} />,
      bg: 'bg-blue-50',
      category: 'construction'
    },
    {
      id: 'roof',
      title: 'ছাদের কংক্রিট হিসাব',
      description: 'ছাদ ঢালাইয়ে সিমেন্ট, বালি, খোয়া/পাথর এবং রডের অনুপাতসহ সম্পূর্ণ হিসাব',
      icon: <Building className="w-7 h-7 text-[#0f766e]" strokeWidth={2} />,
      bg: 'bg-teal-50',
      category: 'construction'
    },
    {
      id: 'loan',
      title: 'লোন ক্যালকুলেটর',
      description: 'মাসিক কিস্তি ও সুদের হিসাব বের করুন',
      icon: <Calculator className="w-7 h-7 text-[#a855f7]" strokeWidth={2} />,
      bg: 'bg-purple-50',
      category: 'finance',
      badge: '👑 Premium'
    },
    {
      id: 'percentage',
      title: 'শতকরা ক্যালকুলেটর',
      description: 'শতকরা, লাভ-ক্ষতি হিসাব করুন',
      icon: <Percent className="w-7 h-7 text-[#ef4444]" strokeWidth={2} />,
      bg: 'bg-red-50',
      category: 'finance'
    },
    {
      id: 'weight',
      title: 'ওজন ক্যালকুলেটর',
      description: 'কেজি, গ্রাম, টন ইউনিট রূপান্তর',
      icon: <Scale className="w-7 h-7 text-[#009664]" strokeWidth={2} />,
      bg: 'bg-emerald-50',
      category: 'general'
    },
    {
      id: 'speed',
      title: 'গতি ক্যালকুলেটর',
      description: 'দূরত্ব, সময়, গতি হিসাব করুন',
      icon: <Gauge className="w-7 h-7 text-[#3b82f6]" strokeWidth={2} />,
      bg: 'bg-blue-50',
      category: 'general'
    },
    {
      id: 'age',
      title: 'বয়স ক্যালকুলেটর',
      description: 'বয়স বের করুন দিন, মাস, বছর',
      icon: <Calendar className="w-7 h-7 text-[#a855f7]" strokeWidth={2} />,
      bg: 'bg-purple-50',
      category: 'general'
    },
    {
      id: 'unit',
      title: 'ইউনিট কনভার্টার',
      description: 'বিভিন্ন ইউনিট রূপান্তর করুন',
      icon: <ArrowRightLeft className="w-7 h-7 text-[#f97316]" strokeWidth={2} />,
      bg: 'bg-orange-50',
      category: 'general'
    },
    {
      id: 'zakat',
      title: 'যাকাত ক্যালকুলেটর',
      description: 'আপনার বাৎসরিক যাকাতের সঠিক পরিমাণ হিসাব করুন',
      icon: <Landmark className="w-7 h-7 text-[#0f766e]" strokeWidth={2} />,
      bg: 'bg-teal-50',
      category: 'islamic'
    },
    {
      id: 'fitra',
      title: 'ফিতরা ক্যালকুলেটর',
      description: 'পরিবারের সদস্য সংখ্যা অনুযায়ী ফিতরার পরিমাণ ও মোট হাদিয়া',
      icon: <Gift className="w-7 h-7 text-[#009664]" strokeWidth={2} />,
      bg: 'bg-emerald-50',
      category: 'islamic'
    },
    {
      id: 'inheritance',
      title: 'উত্তরাধিকার (Inheritance) হিসাব',
      description: 'ইসলামী শরীয়াহ মোতাবেক মৃত ব্যক্তির সম্পত্তি বণ্টন হিসাব',
      icon: <Users className="w-7 h-7 text-[#8b5cf6]" strokeWidth={2} />,
      bg: 'bg-purple-50',
      category: 'islamic'
    },
    {
      id: 'qibla',
      title: 'কিবলা দিক নির্দেশক',
      description: 'আপনার অবস্থান থেকে পবিত্র কাবার নিখুঁত দিক বা কিবলা কোণ নির্ণয়',
      icon: <Compass className="w-7 h-7 text-[#eab308]" strokeWidth={2} />,
      bg: 'bg-yellow-50',
      category: 'islamic'
    },
    {
      id: 'prayer_times',
      title: 'নামাজের সময়সূচী',
      description: 'আপনার এলাকার দৈনিক ৫ ওয়াক্ত নামাজের সঠিক ওয়াক্ত ও সময়',
      icon: <Moon className="w-7 h-7 text-[#3b82f6]" strokeWidth={2} />,
      bg: 'bg-blue-50',
      category: 'islamic'
    },
    {
      id: 'fertilizer',
      title: 'সার পরিমাপ ক্যালকুলেটর',
      description: 'ফসলের ধরনের উপর ভিত্তি করে সারের পরিমাণ',
      icon: <Sprout className="w-7 h-7 text-[#009664]" strokeWidth={2} />,
      bg: 'bg-emerald-50',
      category: 'agriculture'
    },
    {
      id: 'seed',
      title: 'বীজ পরিমাণ ক্যালকুলেটর',
      description: 'ফসলের প্রয়োজনীয় বীজের পরিমাপ',
      icon: <Leaf className="w-7 h-7 text-[#14b8a6]" strokeWidth={2} />,
      bg: 'bg-teal-50',
      category: 'agriculture'
    },
    {
      id: 'irrigation',
      title: 'সেচের পানির হিসাব',
      description: 'ফসলের পানির চাহিদা ও সেচ খরচ নির্ধারণ',
      icon: <Droplet className="w-7 h-7 text-[#3b82f6]" strokeWidth={2} />,
      bg: 'bg-blue-50',
      category: 'agriculture'
    },
    {
      id: 'crop_yield',
      title: 'فসল উৎপাদন হিসাব',
      description: 'ফসলের সম্ভাব্য উৎপাদন ও ফলনের হিসাব',
      icon: <TrendingUp className="w-7 h-7 text-[#eab308]" strokeWidth={2} />,
      bg: 'bg-yellow-50',
      category: 'agriculture'
    },
    {
      id: 'agri_profit',
      title: 'কৃষি লাভ-লোকসান হিসাব',
      description: 'ফসলের চাষাবাদ খরচ ও সম্ভাব্য লাভ-লোকসান',
      icon: <Scale className="w-7 h-7 text-[#ef4444]" strokeWidth={2} />,
      bg: 'bg-red-50',
      category: 'agriculture'
    },
    {
      id: 'bmi',
      title: 'বিএমআই (BMI) ক্যালকুলেটর',
      description: 'আপনার ওজন ও উচ্চতা অনুযায়ী বডি মাস ইনডেক্স এবং স্বাস্থ্যঝুঁকি জানুন',
      icon: <Scale className="w-7 h-7 text-[#ef4444]" strokeWidth={2} />,
      bg: 'bg-red-50',
      category: 'health',
      badge: '🆕 নতুন'
    },
    {
      id: 'ideal_weight',
      title: 'আদর্শ ওজন ক্যালকুলেটর',
      description: 'আপনার উচ্চতা ও লিঙ্গ অনুযায়ী স্বাস্থ্যসম্মত আদর্শ ওজনের পরিসীমা',
      icon: <Activity className="w-7 h-7 text-[#009664]" strokeWidth={2} />,
      bg: 'bg-emerald-50',
      category: 'health'
    },
    {
      id: 'water_intake',
      title: 'পানি পানের পরিমাণ',
      description: 'ওজন, আবহাওয়া ও শারীরিক পরিশ্রম অনুযায়ী দৈনিক প্রয়োজনীয় পানির পরিমাণ',
      icon: <Droplet className="w-7 h-7 text-[#3b82f6]" strokeWidth={2} />,
      bg: 'bg-blue-50',
      category: 'health'
    },
    {
      id: 'pregnancy_due_date',
      title: 'গর্ভধারণের প্রসবের সম্ভাব্য তারিখ',
      description: 'শেষ মাসিকের তারিখ অনুযায়ী সম্ভাব্য প্রসবের দিন ও গর্ভকালীন ট্রাইমেস্টার হিসাব',
      icon: <Calendar className="w-7 h-7 text-[#a855f7]" strokeWidth={2} />,
      bg: 'bg-purple-50',
      category: 'family'
    },
    {
      id: 'calorie',
      title: 'ক্যালরি ক্যালকুলেটর',
      description: 'ওজন নিয়ন্ত্রণ বা ধরে রাখতে আপনার দৈনিক প্রয়োজনীয় শক্তির পরিমাণ হিসাব করুন',
      icon: <Flame className="w-7 h-7 text-[#f97316]" strokeWidth={2} />,
      bg: 'bg-orange-50',
      category: 'health'
    },
    {
      id: 'heart_rate',
      title: 'হৃদস্পন্দন ক্যালকুলেটর',
      description: 'বয়স অনুযায়ী আপনার সর্বোচ্চ ও টার্গেট হার্ট রেট জোনসমূহ হিসাব করুন',
      icon: <Heart className="w-7 h-7 text-[#ef4444]" strokeWidth={2} />,
      bg: 'bg-red-50',
      category: 'health'
    },
    {
      id: 'gpa',
      title: 'জিপিএ (GPA) ক্যালকুলেটর',
      description: 'এসএসসি, এইচএসসি বা সেমিস্টারসমূহ ভিত্তিক জিপিএ গণনা করুন',
      icon: <Award className="w-7 h-7 text-[#009664]" strokeWidth={2} />,
      bg: 'bg-emerald-50',
      category: 'education'
    },
    {
      id: 'cgpa',
      title: 'সিজিপিএ (CGPA) ক্যালকুলেটর',
      description: 'একাধিক সেমিস্টারসমূহের মোট ক্রেডিট ও গ্রেড অনুযায়ী সিজিপিএ হিসাব',
      icon: <GraduationCap className="w-7 h-7 text-[#3b82f6]" strokeWidth={2} />,
      bg: 'bg-blue-50',
      category: 'education'
    },
    {
      id: 'grade',
      title: 'গ্রেড (Grade) ক্যালকুলেটর',
      description: 'প্রাপ্ত নম্বর দিয়ে লেটার গ্রেড এবং গ্রেড ইস্টার চেক করুন',
      icon: <BookOpen className="w-7 h-7 text-[#a855f7]" strokeWidth={2} />,
      bg: 'bg-purple-50',
      category: 'education'
    },
    {
      id: 'study_timer',
      title: 'পড়াশোনা টাইমার (Study Timer)',
      description: 'পোমোডোরো (Pomodoro) পদ্ধতিতে পড়াশোনার সময় ও বিরতি নির্ধারণ করুন',
      icon: <Timer className="w-7 h-7 text-[#ef4444]" strokeWidth={2} />,
      bg: 'bg-red-50',
      category: 'education'
    },
    {
      id: 'profit_margin',
      title: 'প্রফিট মার্জিন ক্যালকুলেটর',
      description: 'পণ্যের ক্রয়মূল্য ও বিক্রয়মূল্যের ভিত্তিতে নিট লাভ, মার্জিন ও মার্কআপ হিসাব করুন',
      icon: <TrendingUp className="w-7 h-7 text-emerald-600" strokeWidth={2} />,
      bg: 'bg-emerald-50',
      category: 'business'
    },
    {
      id: 'gst_vat',
      title: 'ভ্যাট ও জিএসটি ক্যালকুলেটর',
      description: 'যেকোনো মূল্যের উপর ভ্যাট/জিএসটি যুক্ত করুন বা অন্তর্ভুক্ত ভ্যাট বাদ দিন',
      icon: <Percent className="w-7 h-7 text-blue-600" strokeWidth={2} />,
      bg: 'bg-blue-50',
      category: 'business'
    },
    {
      id: 'invoice',
      title: 'ইনভয়েস ক্যালকুলেটর',
      description: 'একাধিক পণ্যের মূল্য, ডিসকাউন্ট ও ভ্যাট হিসাব করে পেশাদার রসিদ তৈরি করুন',
      icon: <Receipt className="w-7 h-7 text-purple-600" strokeWidth={2} />,
      bg: 'bg-purple-50',
      category: 'business'
    },
    {
      id: 'stock',
      title: 'স্টক ও ইনভেন্টরি ক্যালকুলেটর',
      description: 'বর্তমান স্টক, মোট বিক্রয়, পণ্যের বর্তমান মূল্য ও আনুমানিক লাভ ট্র্যাক করুন',
      icon: <Layers className="w-7 h-7 text-amber-600" strokeWidth={2} />,
      bg: 'bg-amber-50',
      category: 'business'
    },
    {
      id: 'roi',
      title: 'রিটার্ন অন ইনভেস্টমেন্ট (ROI)',
      description: 'বিনিয়োগের লাভ, মোট রিটার্ন পার্সেন্টেজ এবং বাৎসরিক চক্রবৃদ্ধি রিটার্ন জানুন',
      icon: <Coins className="w-7 h-7 text-teal-600" strokeWidth={2} />,
      bg: 'bg-teal-50',
      category: 'business'
    },
    {
      id: 'break_even',
      title: 'ব্রেক-ইভেন ক্যালকুলেটর',
      description: 'স্থায়ী ও পরিবর্তনশীল খরচের ভিত্তিতে ব্যবসা লাভজনক করার ন্যূনতম বিক্রয় সীমা',
      icon: <LineChart className="w-7 h-7 text-rose-600" strokeWidth={2} />,
      bg: 'bg-rose-50',
      category: 'business'
    },
    {
      id: 'qr_generator',
      title: 'QR Code জেনারেটর',
      description: 'যেকোনো লিংক বা টেক্সটের জন্য কাস্টম কিউআর কোড তৈরি ও ডাউনলোড করুন',
      icon: <QrCode className="w-7 h-7 text-blue-600" strokeWidth={2} />,
      bg: 'bg-blue-50',
      category: 'utility'
    },
    {
      id: 'barcode_generator',
      title: 'বারকোড জেনারেটর',
      description: 'Code 39 স্ট্যান্ডার্ডে কাস্টম বারকোড তৈরি ও ডাউনলোড করুন',
      icon: <Barcode className="w-7 h-7 text-violet-600" strokeWidth={2} />,
      bg: 'bg-violet-50',
      category: 'utility'
    },
    {
      id: 'password_generator',
      title: 'পাসওয়ার্ড জেনারেটর',
      description: 'অত্যন্ত নিরাপদ ও জটিল পাসওয়ার্ড স্বয়ংক্রিয়ভাবে তৈরি করুন',
      icon: <Key className="w-7 h-7 text-teal-600" strokeWidth={2} />,
      bg: 'bg-teal-50',
      category: 'utility'
    },
    {
      id: 'password_strength',
      title: 'পাসওয়ার্ড শক্তি পরীক্ষক',
      description: 'আপনার পাসওয়ার্ড কতটা শক্তিশালী এবং সুরক্ষিত তা লাইভ পরীক্ষা করুন',
      icon: <ShieldAlert className="w-7 h-7 text-rose-600" strokeWidth={2} />,
      bg: 'bg-rose-50',
      category: 'utility'
    },
    {
      id: 'random_number',
      title: 'র্যান্ডম নম্বর জেনারেটর',
      description: 'নির্দিষ্ট সীমার মধ্যে র্যান্ডম সংখ্যা, ছক্কার দান ও কয়েন টস করুন',
      icon: <Shuffle className="w-7 h-7 text-orange-600" strokeWidth={2} />,
      bg: 'bg-orange-50',
      category: 'utility'
    },
    {
      id: 'color_picker',
      title: 'কালার পিকার ও প্যালেট',
      description: 'পছন্দের রঙের জন্য HEX, RGB ও HSL কোড ও আধুনিক প্যালেট নির্বাচন',
      icon: <Palette className="w-7 h-7 text-indigo-600" strokeWidth={2} />,
      bg: 'bg-indigo-50',
      category: 'utility'
    },
    {
      id: 'color_converter',
      title: 'কালার কনভার্টার',
      description: 'HEX, RGB, HSL এবং CMYK ফরম্যাটে রঙের কোড রুপান্তর করুন',
      icon: <ArrowRightLeft className="w-7 h-7 text-teal-600" strokeWidth={2} />,
      bg: 'bg-teal-50',
      category: 'utility'
    },
    {
      id: 'uuid_generator',
      title: 'UUID জেনারেটর',
      description: 'অনন্য আইডেন্টিফায়ার (UUID v4) একক বা বাল্ক আকারে তৈরি করুন',
      icon: <Fingerprint className="w-7 h-7 text-slate-700" strokeWidth={2} />,
      bg: 'bg-slate-100',
      category: 'utility'
    },
    {
      id: 'text_counter',
      title: 'টেক্সট ও রাইটিং টুলস',
      description: 'শব্দ ও অক্ষর গণনা, কেস কনভার্টার এবং সংখ্যা ↔ বাংলা রূপান্তর',
      icon: <Type className="w-7 h-7 text-blue-600" strokeWidth={2} />,
      bg: 'bg-blue-50',
      category: 'utility'
    },
    {
      id: 'word_counter',
      title: 'শব্দ কাউন্টার ও তুলনা',
      description: 'শব্দ সংখ্যা গণনা, ডুপ্লিকেট রিমুভার এবং দুটি টেক্সটের তুলনা (Compare)',
      icon: <FileText className="w-7 h-7 text-indigo-600" strokeWidth={2} />,
      bg: 'bg-indigo-50',
      category: 'utility'
    },
    {
      id: 'birthday_countdown',
      title: '🎂 জন্মদিন কাউন্টডাউন',
      description: 'আপনার বা আপনার প্রিয়জনদের জন্মদিনের কাউন্টডাউন ও আকর্ষণীয় জীবন পরিসংখ্যান',
      icon: <Gift className="w-7 h-7 text-pink-500" strokeWidth={2} />,
      bg: 'bg-pink-50',
      category: 'family'
    },
    {
      id: 'anniversary_countdown',
      title: '💍 বিবাহবার্ষিকী কাউন্টডাউন',
      description: 'বিবাহবার্ষিকীর কাউন্টডাউন, একসাথে কাটানো মধুর দিন ও বিশেষ উপহার থিম',
      icon: <Heart className="w-7 h-7 text-rose-500" strokeWidth={2} />,
      bg: 'bg-rose-50',
      category: 'family'
    },
    {
      id: 'family_budget',
      title: '👨‍👩‍👧‍👦 পরিবার বাজেট পরিকল্পনাকারী',
      description: 'পারিবারিক আয়ের নিরিখে খরচ ট্র্যাকিং, খাতওয়ারী বরাদ্দ ও আর্থিক পরামর্শ',
      icon: <Coins className="w-7 h-7 text-teal-600" strokeWidth={2} />,
      bg: 'bg-teal-50',
      category: 'family'
    },
    {
      id: 'qr_scanner',
      title: 'কিউআর কোড স্ক্যানার',
      description: 'ক্যামেরা বা ইমেজ থেকে কিউআর কোড স্ক্যান এবং ডিকোড করুন',
      icon: <QrCode className="w-7 h-7 text-indigo-600" strokeWidth={2} />,
      bg: 'bg-indigo-50',
      category: 'digital'
    },
    {
      id: 'file_compressor',
      title: 'ফাইল কম্প্রেশন',
      description: 'ইমেজ সাইজ কমান এবং টেক্সট ফাইল জিপ কমপ্রেস করুন',
      icon: <Layers className="w-7 h-7 text-emerald-600" strokeWidth={2} />,
      bg: 'bg-emerald-50',
      category: 'digital'
    },
    {
      id: 'image_resize',
      title: 'ইমেজ রিসাইজার',
      description: 'ছবির দৈর্ঘ্য, প্রস্থ পরিবর্তন ও স্কেল অ্যাডজাস্ট করুন',
      icon: <Ruler className="w-7 h-7 text-violet-600" strokeWidth={2} />,
      bg: 'bg-violet-50',
      category: 'digital'
    },
    {
      id: 'pdf_merge',
      title: 'পিডিএফ মার্জার',
      description: 'একাধিক পিডিএফ ফাইল একত্রিত করে একটি ফাইল তৈরি করুন',
      icon: <FileText className="w-7 h-7 text-teal-600" strokeWidth={2} />,
      bg: 'bg-teal-50',
      category: 'digital'
    },
    {
      id: 'pdf_split',
      title: 'পিডিএফ স্প্লিটার',
      description: 'পিডিএফ ফাইল থেকে নির্দিষ্ট পৃষ্ঠা আলাদা বা বিভক্ত করুন',
      icon: <Scissors className="w-7 h-7 text-cyan-600" strokeWidth={2} />,
      bg: 'bg-cyan-50',
      category: 'digital'
    },
    {
      id: 'pdf_to_image',
      title: 'পিডিএফ থেকে ছবি',
      description: 'পিডিএফ ফাইলের প্রতিটি পৃষ্ঠাকে জেপিজি/পিএনজি ছবিতে রূপান্তর করুন',
      icon: <Eye className="w-7 h-7 text-amber-600" strokeWidth={2} />,
      bg: 'bg-amber-50',
      category: 'digital'
    },
    {
      id: 'image_to_pdf',
      title: 'ছবি থেকে পিডিএফ',
      description: 'একাধিক ছবি দিয়ে একটি পিডিএফ ডকুমেন্ট তৈরি করুন',
      icon: <FileImage className="w-7 h-7 text-rose-600" strokeWidth={2} />,
      bg: 'bg-rose-50',
      category: 'digital'
    },
    {
      id: 'compress_pdf',
      title: 'Compress PDF',
      description: 'পিডিএফ ফাইলের সাইজ কমান',
      icon: <Layers className="w-7 h-7 text-indigo-600" strokeWidth={2} />,
      bg: 'bg-indigo-50',
      category: 'digital'
    },
    {
      id: 'rotate_pdf',
      title: 'Rotate PDF',
      description: 'পিডিএফ ফাইলের পৃষ্ঠাগুলো ঘুরান',
      icon: <RotateCcw className="w-7 h-7 text-emerald-600" strokeWidth={2} />,
      bg: 'bg-emerald-50',
      category: 'digital'
    }
  ];

  const categories = [
    { id: 'all', label: 'সকল', icon: <LayoutGrid size={16} /> },
    { id: 'land', label: 'জমি', icon: <Leaf size={16} /> },
    { id: 'agriculture', label: 'কৃষি', icon: <Sprout size={16} /> },
    { id: 'construction', label: 'নির্মাণ', icon: <Building2 size={16} /> },
    { id: 'islamic', label: 'ইসলামিক', icon: <Moon size={16} /> },
    { id: 'health', label: 'স্বাস্থ্য', icon: <Heart size={16} /> },
    { id: 'family', label: 'পরিবার', icon: <Users size={16} /> },
    { id: 'education', label: 'শিক্ষা', icon: <GraduationCap size={16} /> },
    { id: 'business', label: 'ব্যবসা', icon: <Briefcase size={16} /> },
    { id: 'utility', label: 'স্মার্ট ইউটিলিটি', icon: <Wrench size={16} /> },
    { id: 'digital', label: 'ডিজিটাল টুলস', icon: <Laptop size={16} /> }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesTab = activeTab === 'all' || tool.category === activeTab;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || 
      tool.title.toLowerCase().includes(query) || 
      tool.description.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  const renderActiveCalculator = () => {
    switch (activeCalculator) {
      case 'gpa': return <GPACalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'cgpa': return <CGPACalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'grade': return <GradeCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'study_timer': return <StudyTimer onGoBack={() => setActiveCalculator(null)} />;
      case 'bmi': return <BMICalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'ideal_weight': return <IdealWeightCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'water_intake': return <WaterIntakeCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'pregnancy_due_date': return <PregnancyDueDateCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'calorie': return <CalorieCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'heart_rate': return <HeartRateCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'zakat': return <ZakatCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'fitra': return <FitraCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'inheritance': return <InheritanceCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'qibla': return <QiblaCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'prayer_times': return <PrayerTimesCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'land': return (
        <div className="space-y-6">
          <LandCalculator onGoBack={() => setActiveCalculator(null)} />
          <ToolExtraInfo toolId="land" />
        </div>
      );
      case 'fertilizer': return <FertilizerCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'seed': return <SeedCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'irrigation': return <IrrigationCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'crop_yield': return <CropYieldCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'agri_profit': return <AgriProfitCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'brick': return (
        <div className="space-y-6">
          <BrickCalculator onGoBack={() => setActiveCalculator(null)} />
          <ToolExtraInfo toolId="brick" />
        </div>
      );
      case 'cement': return <CementCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'rod': return <RodCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'sand': return <SandCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'tiles': return <TilesCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'paint': return <PaintCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'roof': return <RoofConcreteCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'age': return <AgeCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'profit_margin': return <ProfitMarginCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'gst_vat': return <GSTVATCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'invoice': return <InvoiceCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'stock': return <StockCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'roi': return <ROICalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'break_even': return <BreakEvenCalculator onGoBack={() => setActiveCalculator(null)} />;
      case 'qr_generator': return <QRCodeGenerator onGoBack={() => setActiveCalculator(null)} />;
      case 'barcode_generator': return <BarcodeGenerator onGoBack={() => setActiveCalculator(null)} />;
      case 'password_generator': return <PasswordUtility onGoBack={() => setActiveCalculator(null)} initialTab="generate" />;
      case 'password_strength': return <PasswordUtility onGoBack={() => setActiveCalculator(null)} initialTab="check" />;
      case 'random_number': return <RandomNumberGenerator onGoBack={() => setActiveCalculator(null)} />;
      case 'color_picker': return <ColorUtility onGoBack={() => setActiveCalculator(null)} initialTab="picker" />;
      case 'color_converter': return <ColorUtility onGoBack={() => setActiveCalculator(null)} initialTab="converter" />;
      case 'uuid_generator': return <UUIDGenerator onGoBack={() => setActiveCalculator(null)} />;
      case 'text_counter':
      case 'word_counter':
        return <TextCounterUtility onGoBack={() => setActiveCalculator(null)} />;
      case 'birthday_countdown': return <BirthdayCountdown onGoBack={() => setActiveCalculator(null)} />;
      case 'anniversary_countdown': return <AnniversaryCountdown onGoBack={() => setActiveCalculator(null)} />;
      case 'family_budget': return <FamilyBudgetPlanner onGoBack={() => setActiveCalculator(null)} />;
      case 'unit':
      case 'weight':
        return <UnitConverter onGoBack={() => setActiveCalculator(null)} />;
      case 'qr_scanner':
      case 'file_compressor':
      case 'image_resize':
      case 'pdf_merge':
      case 'pdf_split':
      case 'pdf_to_image':
      case 'image_to_pdf':
        return <DigitalTools initialTool={activeCalculator} onGoBack={() => setActiveCalculator(null)} />;
      default:
        return (
          <div className="p-4 text-center mt-20">
            <h2 className="text-xl font-bold mb-4">এই টুলটি শীঘ্রই আসছে!</h2>
            <button onClick={() => setActiveCalculator(null)} className="px-6 py-2 bg-[#009664] text-white rounded-lg font-bold">ফিরে যান</button>
          </div>
        );
    }
  };

  if (activeCalculator) {
    const activeTool = tools.find(t => t.id === activeCalculator);
    const toolTitle = activeTool ? activeTool.title : 'Tool';

    return (
      <div className="w-full bg-[#fafcfb] min-h-[70vh]">
        <div className="max-w-4xl mx-auto px-4 pt-4">
          {renderActiveCalculator()}
          <ToolFeedbackFooter contentId={activeCalculator} contentTitle={toolTitle} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fafcfb] flex flex-col font-sans pb-10">
      {/* Header */}
      <div className="bg-[#006847] px-4 pt-4 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

        <div className="flex items-center justify-between mb-6 h-12 relative z-30">
          {isSearching ? (
            <div className="flex items-center gap-3 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-3 py-2 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
              <Search size={18} className="text-white" />
              <input
                type="text"
                autoFocus
                placeholder="টুল খুঁজুন..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[15px] font-bold text-white placeholder:text-white/60"
              />
              <button 
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery('');
                }}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/70"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button 
                  onClick={onGoBack}
                  className="p-3 -ml-3 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer relative z-50"
                  type="button"
                >
                  <ArrowLeft size={28} className="stroke-[2.5]" />
                </button>
                <h1 className="text-[20px] font-black text-white leading-tight">সব টুল ও ক্যালকুলেটর</h1>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSearching(true)}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white bg-white/10 backdrop-blur-sm shadow-sm hover:bg-white/20 transition-colors relative z-50 cursor-pointer"
                  type="button"
                >
                  <Search size={18} strokeWidth={2.5} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Hero Banner Card */}
        {!isSearching && (
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 shadow-inner overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center bg-emerald-500/30 text-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/20">
                  গুরুত্বপূর্ণ তথ্য
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-white leading-tight">
                    সকল প্রয়োজনীয় টুলস ও ক্যালকুলেটর একসাথে
                  </h2>
                  <p className="text-xs font-medium text-emerald-50/80 leading-relaxed">
                    জমি, কৃষি, নির্মাণ ও যাকাত সম্পর্কিত ৮৬টি টুল নিয়মিত আপডেট পেতে আমাদের সাথে থাকুন।
                  </p>
                </div>
              </div>
              <div className="ml-4 opacity-40 group-hover:opacity-60 transition-opacity">
                <Megaphone size={56} className="text-white -rotate-12" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="bg-white rounded-t-[32px] -mt-8 pt-7 pb-3 px-4 relative z-20 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]">
        <div className="flex overflow-x-auto no-scrollbar gap-2.5 pb-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full whitespace-nowrap text-[13px] sm:text-[14px] font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-[#006847] text-white border-[#006847] shadow-md shadow-emerald-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className={`shrink-0 ${activeTab === cat.id ? 'text-white' : 'text-slate-400'}`}>
                {cat.icon}
              </span>
              <span className="shrink-0">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-2 space-y-6">
        {searchQuery.trim() !== '' ? (
          <div className="mb-12 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search size={20} className="text-[#009664]" strokeWidth={2.5} />
                <h2 className="text-[16px] font-black text-slate-800">অনুসন্ধান ফলাফল ({filteredTools.length})</h2>
              </div>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-rose-500 hover:underline"
              >
                মুছে ফেলুন
              </button>
            </div>

            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredTools.map((tool) => (
                  <div key={tool.id} className="flex flex-col gap-1">
                    <div 
                      onClick={() => setActiveCalculator(tool.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveCalculator(tool.id); }}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer bg-white rounded-[20px] p-4 flex flex-col items-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100/80 hover:border-emerald-100 hover:shadow-md transition-all active:scale-[0.98] active:bg-slate-50 relative group h-[195px]"
                    >
                      {tool.badge && (
                        <div className="absolute top-2 left-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                          {tool.badge}
                        </div>
                      )}
                      {tool.isOffline && (
                        <div className="absolute bottom-2.5 left-2.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                          📱 Offline
                        </div>
                      )}
                      <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
                        <FavoriteButton item={{ id: tool.id, type: 'service', title: tool.title, subtitle: tool.description }} className="bg-white/90 shadow-sm" />
                        <ShareButton title={tool.title} text={tool.description} />
                      </div>
                      <div className={`w-[60px] h-[60px] rounded-full ${tool.bg} flex items-center justify-center shrink-0 mb-3`}>
                        {tool.icon}
                      </div>
                      
                      <h3 className="text-[14px] font-black text-slate-800 leading-tight mb-1 group-hover:text-[#009664] transition-colors h-[36px] line-clamp-2">{tool.title}</h3>
                      <p className="text-[11px] font-bold text-slate-400 leading-snug line-clamp-2">{tool.description}</p>
                      
                      <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                        <ChevronRight size={14} className="text-slate-400 group-hover:text-[#009664]" strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[32px] p-10 flex flex-col items-center text-center border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Search size={32} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1">কোনো টুল পাওয়া যায়নি</h3>
                <p className="text-sm font-bold text-slate-400 max-w-[240px]">দুঃখিত, আপনার অনুসন্ধান করা টুলটি আমাদের তালিকায় নেই। অন্য কিছু লিখে চেষ্টা করুন।</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-6 px-6 py-2.5 bg-[#009664] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                >
                  সব টুল দেখুন
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Popular Tools Section */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Flame size={20} className="text-[#009664]" strokeWidth={2.5} />
                <h2 className="text-[16px] font-black text-slate-800">জনপ্রিয় টুলস</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredTools.slice(0, 4).map((tool) => (
                    <div key={tool.id} className="flex flex-col gap-1">
                      <div 
                        onClick={() => setActiveCalculator(tool.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveCalculator(tool.id); }}
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer bg-white rounded-[20px] p-4 flex flex-col items-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100/80 hover:border-emerald-100 hover:shadow-md transition-all active:scale-[0.98] active:bg-slate-50 relative group h-[195px]"
                      >
                        {tool.badge && (
                          <div className="absolute top-2 left-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                            {tool.badge}
                          </div>
                        )}
                        {tool.isOffline && (
                          <div className="absolute bottom-2.5 left-2.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                            📱 Offline
                          </div>
                        )}
                        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
                          <FavoriteButton item={{ id: tool.id, type: 'service', title: tool.title, subtitle: tool.description }} className="bg-white/90 shadow-sm" />
                          <ShareButton title={tool.title} text={tool.description} />
                        </div>
                        <div className={`w-[60px] h-[60px] rounded-full ${tool.bg} flex items-center justify-center shrink-0 mb-3`}>
                          {tool.icon}
                        </div>
                        
                        <h3 className="text-[14px] font-black text-slate-800 leading-tight mb-1 group-hover:text-[#009664] transition-colors h-[36px] line-clamp-2">{tool.title}</h3>
                        <p className="text-[11px] font-bold text-slate-400 leading-snug line-clamp-2">{tool.description}</p>
                        
                        <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                          <ChevronRight size={14} className="text-slate-400 group-hover:text-[#009664]" strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            {/* New Categories */}
            {[
              { title: '🔥 নতুন যুক্ত হয়েছে', tools: filteredTools.slice(-4) },
              { title: '⭐ সবচেয়ে ব্যবহৃত', tools: filteredTools.slice(4, 8) },
              { title: '❤️ প্রিয় টুলস', tools: filteredTools.slice(8, 12) },
              { title: '🕒 সম্প্রতি ব্যবহৃত', tools: filteredTools.slice(12, 16) },
              { title: '📌 Recommended Tools', tools: filteredTools.slice(16, 20) },
            ].map((section, idx) => (
              <div key={idx} className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-[16px] font-black text-slate-800">{section.title}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {section.tools.map((tool) => (
                    <div key={tool.id} className="flex flex-col gap-1">
                      <div 
                        onClick={() => setActiveCalculator(tool.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveCalculator(tool.id); }}
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer bg-white rounded-[20px] p-4 flex flex-col items-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100/80 hover:border-emerald-100 hover:shadow-md transition-all active:scale-[0.98] active:bg-slate-50 relative group h-[195px]"
                      >
                        {tool.badge && (
                          <div className="absolute top-2 left-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                            {tool.badge}
                          </div>
                        )}
                        {tool.isOffline && (
                          <div className="absolute bottom-2.5 left-2.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                            📱 Offline
                          </div>
                        )}
                        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
                          <FavoriteButton item={{ id: tool.id, type: 'service', title: tool.title, subtitle: tool.description }} className="bg-white/90 shadow-sm" />
                          <ShareButton title={tool.title} text={tool.description} />
                        </div>
                        <div className={`w-[60px] h-[60px] rounded-full ${tool.bg} flex items-center justify-center shrink-0 mb-3`}>
                          {tool.icon}
                        </div>
                        
                        <h3 className="text-[14px] font-black text-slate-800 leading-tight mb-1 group-hover:text-[#009664] transition-colors h-[36px] line-clamp-2">{tool.title}</h3>
                        <p className="text-[11px] font-bold text-slate-400 leading-snug line-clamp-2">{tool.description}</p>
                        
                        <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                          <ChevronRight size={14} className="text-slate-400 group-hover:text-[#009664]" strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Other Tools Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wrench size={20} className="text-[#009664]" strokeWidth={2.5} />
              <h2 className="text-[16px] font-black text-slate-800">অন্যান্য টুলস</h2>
            </div>
            <button className="px-4 py-2 bg-emerald-50 text-[#009664] rounded-lg text-[13px] font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors">
              সব দেখুন <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>

          {/* Promotional Banner */}
          <div className="bg-[#f2faf7] border border-emerald-100 rounded-[20px] p-5 flex items-center gap-4 relative overflow-hidden mt-4">
            <div className="w-[52px] h-[52px] rounded-full bg-[#009664] flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 relative z-10">
              <Star size={26} className="text-white fill-white" strokeWidth={1.5} />
            </div>
            
            <div className="flex-1 relative z-10">
              <h2 className="text-[15px] font-black text-[#01412F]">সহজ হিসাব, সঠিক ফলাফল</h2>
              <p className="text-[11px] font-bold text-slate-500 mt-1 leading-snug pr-12">আমাদের টুলস ব্যবহার করে দ্রুত ও সঠিক হিসাব করুন। সম্পূর্ণ ফ্রি এবং সহজ ব্যবহারযোগ্য।</p>
              <button 
                onClick={() => setActiveTab('all')}
                className="inline-block mt-3 text-[12px] font-bold text-[#009664] hover:underline flex items-center gap-1"
              >
                সব ক্যালকুলেটর দেখুন <ChevronRight size={12} />
              </button>
            </div>
            
            <div className="absolute right-[-10px] bottom-[-20px] h-[120px] w-[120px] opacity-20 pointer-events-none flex items-center justify-center rotate-[-15deg]">
               <Calculator size={100} className="text-[#009664]" />
            </div>
          </div>

          {/* Tool Request Section */}
          <ToolRequestSection />
        </div>
      </div>
    </div>
  );
}

// ---------------- Zakat Calculator ----------------
function ZakatCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [cash, setCash] = useState('');
  const [goldSilver, setGoldSilver] = useState('');
  const [business, setBusiness] = useState('');
  const [liabilities, setLiabilities] = useState('');

  const calculateZakat = () => {
    const totalAssets = (Number(cash) || 0) + (Number(goldSilver) || 0) + (Number(business) || 0);
    const netAssets = totalAssets - (Number(liabilities) || 0);
    const zakatAmount = netAssets > 0 ? (netAssets * 0.025) : 0;
    
    return { netAssets, zakatAmount };
  };

  const { netAssets, zakatAmount } = calculateZakat();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">যাকাত ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">সম্পদ ও দায়ের ভিত্তিতে যাকাত হিসাব করুন</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">নগদ অর্থ ও ব্যাংক ব্যালেন্স (৳)</label>
          <input type="number" value={cash || ""} onChange={e => setCash(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-emerald-500" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">স্বর্ণ ও রৌপ্যের বর্তমান মূল্য (৳)</label>
          <input type="number" value={goldSilver || ""} onChange={e => setGoldSilver(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-emerald-500" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">ব্যবসার পণ্যের মূল্য (৳)</label>
          <input type="number" value={business || ""} onChange={e => setBusiness(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-emerald-500" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-bold text-rose-600 mb-1">ঋণ বা দায় (৳) - বাদ যাবে</label>
          <input type="number" value={liabilities || ""} onChange={e => setLiabilities(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-emerald-500" placeholder="0" />
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6">
          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
            <p className="text-sm text-emerald-800 font-bold mb-1">নিট সম্পদ: ৳ {netAssets.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-600 mb-2">(নিসাব পরিমাণ হলে যাকাত ফরজ হবে)</p>
            <div className="text-3xl font-black text-emerald-600">
              ৳ {zakatAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-emerald-700 font-bold mt-1">প্রদেয় যাকাত (২.৫%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Land Area Calculator ----------------
function LandCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [length1, setLength1] = useState('');
  const [length2, setLength2] = useState('');
  const [width1, setWidth1] = useState('');
  const [width2, setWidth2] = useState('');

  const calculateArea = () => {
    const l1 = Number(length1) || 0;
    const l2 = Number(length2) || 0;
    const w1 = Number(width1) || 0;
    const w2 = Number(width2) || 0;

    const avgLength = (l1 + l2) / 2;
    const avgWidth = (w1 + w2) / 2;
    const sqFeet = avgLength * avgWidth;

    return {
      sqFeet,
      shotok: sqFeet / 435.6,
      katha: sqFeet / 720,
      bigha: sqFeet / 14400,
      acre: sqFeet / 43560
    };
  };

  const results = calculateArea();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 hover:bg-amber-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">ভূমি মাপজোক ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">দৈর্ঘ্য ও প্রস্থ দিয়ে জমির পরিমাণ জানুন</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">দৈর্ঘ্য ১ (ফুট)</label>
            <input type="number" value={length1 || ""} onChange={e => setLength1(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">দৈর্ঘ্য ২ (ফুট)</label>
            <input type="number" value={length2 || ""} onChange={e => setLength2(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3" placeholder="0" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">প্রস্থ ১ (ফুট)</label>
            <input type="number" value={width1 || ""} onChange={e => setWidth1(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">প্রস্থ ২ (ফুট)</label>
            <input type="number" value={width2 || ""} onChange={e => setWidth2(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3" placeholder="0" />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6 grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xs text-gray-500 font-bold mb-1">বর্গফুট</p>
            <p className="text-lg font-black text-gray-800">{results.sqFeet.toFixed(2)}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
            <p className="text-xs text-amber-700 font-bold mb-1">শতক</p>
            <p className="text-lg font-black text-amber-600">{results.shotok.toFixed(3)}</p>
          </div>
          <div className="bg-sky-50 rounded-xl p-3 text-center border border-sky-100">
            <p className="text-xs text-sky-700 font-bold mb-1">কাঠা</p>
            <p className="text-lg font-black text-sky-600">{results.katha.toFixed(3)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
            <p className="text-xs text-emerald-700 font-bold mb-1">বিঘা</p>
            <p className="text-lg font-black text-emerald-600">{results.bigha.toFixed(3)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Brick Calculator (ইট হিসাব) ----------------
function BrickCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [wallLength, setWallLength] = useState('');
  const [wallHeight, setWallHeight] = useState('');
  const [thickness, setThickness] = useState('5'); // 5 inch or 10 inch
  const [brickPrice, setBrickPrice] = useState('12');

  const calculateBricks = () => {
    const l = Number(wallLength) || 0;
    const h = Number(wallHeight) || 0;
    const t = Number(thickness) || 5;
    const price = Number(brickPrice) || 0;

    const area = l * h;
    // Standard brickwork in Bangladesh:
    // For 5" wall: 5 bricks per sqft
    // For 10" wall: 10 bricks per sqft
    const factor = t === 10 ? 10 : 5;
    const rawBricks = area * factor;
    // Add 5% wastage
    const totalBricks = Math.ceil(rawBricks * 1.05);
    const totalCost = totalBricks * price;

    // Mortar estimation (approximate cement-sand requirement per sqft of wall area)
    // 5" wall takes ~0.025 bags cement & ~0.125 cft sand per sqft
    // 10" wall takes ~0.05 bags cement & ~0.25 cft sand per sqft
    const cementFactor = t === 10 ? 0.05 : 0.025;
    const sandFactor = t === 10 ? 0.25 : 0.125;

    const cementBags = Math.ceil(area * cementFactor);
    const sandCft = Math.ceil(area * sandFactor);

    return {
      area,
      totalBricks,
      totalCost,
      cementBags,
      sandCft
    };
  };

  const results = calculateBricks();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 hover:bg-orange-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800 font-sans">ইট হিসাব ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">দেয়ালের মাপ অনুযায়ী ইটের সংখ্যা ও খরচ নির্ণয়</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">দেয়ালের দৈর্ঘ্য (ফুট)</label>
            <input 
              type="number" 
              value={wallLength || ""} 
              onChange={e => setWallLength(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-orange-500" 
              placeholder="উদা: ২০" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">দেয়ালের উচ্চতা (ফুট)</label>
            <input 
              type="number" 
              value={wallHeight || ""} 
              onChange={e => setWallHeight(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-orange-500" 
              placeholder="উদা: ১০" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">দেয়ালের পুরুত্ব (ইঞ্চি)</label>
            <select 
              value={thickness || ""} 
              onChange={e => setThickness(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-orange-500"
            >
              <option value="5">৫ ইঞ্চি দেয়াল (5" Wall)</option>
              <option value="10">১০ ইঞ্চি দেয়াল (10" Wall)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">প্রতিটি ইটের মূল্য (৳)</label>
            <input 
              type="number" 
              value={brickPrice || ""} 
              onChange={e => setBrickPrice(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-orange-500" 
              placeholder="১২" 
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6 space-y-4">
          <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-5 text-center">
            <p className="text-xs font-bold text-orange-800">প্রয়োজনীয় মোট ইট (৫% অপচয়সহ)</p>
            <p className="text-3xl font-black text-orange-700 mt-1">
              {results.totalBricks.toLocaleString('en-IN')} টি
            </p>
            <p className="text-[12px] font-bold text-slate-500 mt-1">
              দেয়ালের মোট ক্ষেত্রফল: {results.area.toFixed(1)} বর্গফুট
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 block">সিমেন্ট লাগবে</span>
              <p className="text-sm font-black text-slate-700 mt-1">{results.cementBags} ব্যাগ</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 block">বালি লাগবে</span>
              <p className="text-sm font-black text-slate-700 mt-1">{results.sandCft} CFT</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 block">ইটের আনুমানিক খরচ</span>
              <p className="text-sm font-black text-slate-700 mt-1">৳ {results.totalCost.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed font-semibold">
            ℹ️ পরামর্শ: গাঁথুনির মসল্লা বা মর্টার (সিমেন্ট ও বালি) ১:৪ বা ১:৫ অনুপাতে গোলানোর পরামর্শ দেওয়া হচ্ছে।
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Rod Calculator (রড হিসাব) ----------------
function RodCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [diameter, setDiameter] = useState('10'); // in mm
  const [rodLength, setRodLength] = useState('');
  const [lengthUnit, setLengthUnit] = useState('feet'); // feet or meters
  const [tonPrice, setTonPrice] = useState('95000'); // Taka per ton

  const calculateRod = () => {
    const d = Number(diameter) || 0;
    const len = Number(rodLength) || 0;
    const pricePerTon = Number(tonPrice) || 0;

    // Weight formula:
    // W = D^2 / 162.2 kg per meter
    // W = D^2 / 532.2 kg per foot
    const kgPerUnit = lengthUnit === 'meters' ? (d * d) / 162.2 : (d * d) / 532.17;
    const totalWeightKg = len * kgPerUnit;
    const totalTons = totalWeightKg / 1000;
    const totalCost = totalTons * pricePerTon;

    return {
      totalWeightKg,
      totalTons,
      totalCost,
      kgPerUnit
    };
  };

  const results = calculateRod();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">রড হিসাব ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">রডের ব্যাস ও দৈর্ঘ্য অনুযায়ী নিখুঁত ওজন ও খরচ পরিমাপ</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">রডের ব্যাস (Diameter)</label>
            <select 
              value={diameter || ""} 
              onChange={e => setDiameter(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-blue-500"
            >
              <option value="8">8 mm</option>
              <option value="10">10 mm (৩ সুতা)</option>
              <option value="12">12 mm (৪ সুতা)</option>
              <option value="16">16 mm (৫ সুতা)</option>
              <option value="20">20 mm (৬ সুতা)</option>
              <option value="22">22 mm (৭ সুতা)</option>
              <option value="25">25 mm (৮ সুতা)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">রডের মোট দৈর্ঘ্য</label>
            <input 
              type="number" 
              value={rodLength || ""} 
              onChange={e => setRodLength(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-blue-500" 
              placeholder="দৈর্ঘ্য লিখুন" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">দৈর্ঘ্যের একক</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setLengthUnit('feet')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  lengthUnit === 'feet' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                ফুট (Feet)
              </button>
              <button 
                onClick={() => setLengthUnit('meters')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  lengthUnit === 'meters' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                মিটার (Meter)
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">প্রতি টন রডের মূল্য (৳)</label>
            <input 
              type="number" 
              value={tonPrice || ""} 
              onChange={e => setTonPrice(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-blue-500" 
              placeholder="95000" 
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6 space-y-4">
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 text-center">
            <p className="text-xs font-bold text-blue-800">মোট ওজন (রড)</p>
            <p className="text-3xl font-black text-blue-700 mt-1">
              {results.totalWeightKg.toFixed(2)} কেজি
            </p>
            <p className="text-[12px] font-bold text-slate-500 mt-1">
              ({results.totalTons.toFixed(4)} টন | ১ ফুটের আনুমানিক ওজন: {results.kgPerUnit.toFixed(4)} কেজি)
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center text-xs font-bold text-slate-600">
            <span>আনুমানিক মোট বাজার মূল্য:</span>
            <span className="text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-full text-sm font-black">
              ৳ {results.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Cement Calculator (সিমেন্ট হিসাব) ----------------
function CementCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [area, setArea] = useState('');
  const [workType, setWorkType] = useState('plaster'); // plaster, casting, brick5, brick10
  const [bagPrice, setBagPrice] = useState('550');

  const calculateCement = () => {
    const a = Number(area) || 0;
    const price = Number(bagPrice) || 0;

    // Approximations per sqft
    const rates: Record<string, { cement: number, sand: number, label: string }> = {
      plaster: { cement: 0.007, sand: 0.035, label: 'প্লাস্টার কাজ (১২ মিমি বা ০.৫ ইঞ্চি)' },
      casting: { cement: 0.035, sand: 0.08, label: 'মেঝে ঢালাই বা প্যাটিং (২ ইঞ্চি)' },
      brick5: { cement: 0.015, sand: 0.075, label: '৫ ইঞ্চি দেয়াল গাঁথুনি' },
      brick10: { cement: 0.03, sand: 0.15, label: '১০ ইঞ্চি দেয়াল গাঁথুনি' }
    };

    const current = rates[workType] || rates.plaster;
    const cementBags = Math.ceil(a * current.cement);
    const sandCft = Math.ceil(a * current.sand);
    const totalCost = cementBags * price;

    return {
      cementBags,
      sandCft,
      totalCost,
      label: current.label
    };
  };

  const results = calculateCement();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">সিমেন্ট হিসাব ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">কাজের ধরন ও ক্ষেত্রফল অনুযায়ী সিমেন্টের পরিমাণ ও বালি হিসাব</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">কাজের ধরন নির্বাচন করুন</label>
          <select 
            value={workType || ""} 
            onChange={e => setWorkType(e.target.value)} 
            className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-indigo-500"
          >
            <option value="plaster">দেয়াল প্লাস্টার (Plastering)</option>
            <option value="casting">মেঝে ঢালাই/প্যাটিং (Floor Soling / Casting 2")</option>
            <option value="brick5">৫ ইঞ্চি ইটের গাঁথুনি (5" Brick Laying)</option>
            <option value="brick10">১০ ইঞ্চি ইটের গাঁথুনি (10" Brick Laying)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">মোট ক্ষেত্রফল (বর্গফুট)</label>
            <input 
              type="number" 
              value={area || ""} 
              onChange={e => setArea(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-indigo-500" 
              placeholder="উদা: ৫০০" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">প্রতি ব্যাগ সিমেন্টের দাম (৳)</label>
            <input 
              type="number" 
              value={bagPrice || ""} 
              onChange={e => setBagPrice(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-indigo-500" 
              placeholder="৫৫০" 
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6 space-y-4">
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 text-center">
            <p className="text-xs font-bold text-indigo-800">প্রয়োজনীয় সিমেন্টের মোট পরিমাণ</p>
            <p className="text-3xl font-black text-indigo-700 mt-1">
              {results.cementBags.toLocaleString('en-IN')} ব্যাগ
            </p>
            <p className="text-[12px] font-bold text-slate-500 mt-1">
              ({results.label})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
              <span className="text-xs font-bold text-slate-400">প্রয়োজনীয় বালি</span>
              <p className="text-lg font-black text-slate-700 mt-1">{results.sandCft} CFT</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
              <span className="text-xs font-bold text-slate-400">সিমেন্টের আনুমানিক খরচ</span>
              <p className="text-lg font-black text-slate-700 mt-1">৳ {results.totalCost.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Sand Calculator (বালু হিসাব) ----------------
function SandCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [sandMode, setSandMode] = useState('area'); // cft, area
  const [volumeCft, setVolumeCft] = useState('');
  const [areaSqft, setAreaSqft] = useState('');
  const [thickness, setThickness] = useState('3'); // in inches
  const [cftPrice, setCftPrice] = useState('45');

  const calculateSand = () => {
    const price = Number(cftPrice) || 0;
    let finalCft = 0;

    if (sandMode === 'cft') {
      finalCft = Number(volumeCft) || 0;
    } else {
      const a = Number(areaSqft) || 0;
      const t = Number(thickness) || 0;
      // Volume = Area * Thickness (converted to feet)
      finalCft = (a * t) / 12;
    }

    const totalCost = finalCft * price;
    // Approximations for truck loads
    // 1 Mini truck (পিকআপ) = roughly 100 cft
    // 1 Standard truck = roughly 300 cft
    const miniTrucks = finalCft / 100;
    const stdTrucks = finalCft / 300;

    return {
      finalCft,
      totalCost,
      miniTrucks,
      stdTrucks
    };
  };

  const results = calculateSand();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 hover:bg-amber-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">বালু হিসাব ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">নির্মাণ কাজে প্রয়োজনীয় বালি (CFT) ও ট্রাক লোডের হিসাব</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">পরিমাপের মাধ্যম</label>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setSandMode('area')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                sandMode === 'area' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              ক্ষেত্রফল ও পুরুত্ব দিয়ে
            </button>
            <button 
              onClick={() => setSandMode('cft')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                sandMode === 'cft' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              সরাসরি ঘনফুট (CFT) দিয়ে
            </button>
          </div>
        </div>

        {sandMode === 'area' ? (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">মোট ক্ষেত্রফল (বর্গফুট)</label>
              <input 
                type="number" 
                value={areaSqft || ""} 
                onChange={e => setAreaSqft(e.target.value)} 
                className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-amber-500" 
                placeholder="উদা: ৪০০" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">পুরুত্ব / গভীরতা (ইঞ্চি)</label>
              <input 
                type="number" 
                value={thickness || ""} 
                onChange={e => setThickness(e.target.value)} 
                className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-amber-500" 
                placeholder="উদা: ৩" 
              />
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <label className="block text-sm font-bold text-gray-700 mb-1">মোট পরিমাণ (ঘনফুট বা CFT)</label>
            <input 
              type="number" 
              value={volumeCft || ""} 
              onChange={e => setVolumeCft(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-amber-500" 
              placeholder="উদা: ১৫০" 
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">প্রতি CFT বালুর মূল্য (৳)</label>
          <input 
            type="number" 
            value={cftPrice || ""} 
            onChange={e => setCftPrice(e.target.value)} 
            className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-amber-500" 
            placeholder="৪৫" 
          />
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6 space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
            <p className="text-xs font-bold text-amber-800">মোট বালির পরিমাণ</p>
            <p className="text-3xl font-black text-amber-700 mt-1">
              {results.finalCft.toFixed(1)} CFT
            </p>
            <p className="text-[12px] font-bold text-slate-500 mt-1">
              আনুমানিক মূল্য: ৳ {results.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
              <span className="text-xs font-bold text-slate-400 block">মিনি পিকআপ (১০০ cft)</span>
              <p className="text-base font-black text-slate-700 mt-1">{results.miniTrucks.toFixed(1)} গাড়ি</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
              <span className="text-xs font-bold text-slate-400 block">বড় ডাম্প ট্রাক (৩০০ cft)</span>
              <p className="text-base font-black text-slate-700 mt-1">{results.stdTrucks.toFixed(1)} গাড়ি</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Tiles Calculator (টাইলস হিসাব) ----------------
function TilesCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [area, setArea] = useState('');
  const [tilesSize, setTilesSize] = useState('12x12'); // in inches
  const [pricePerSqft, setPricePerSqft] = useState('80');

  const calculateTiles = () => {
    const a = Number(area) || 0;
    const price = Number(pricePerSqft) || 0;

    // Convert tile dimension to sqft
    const dimensions: Record<string, { w: number, h: number, label: string }> = {
      '12x12': { w: 12, h: 12, label: '12" × 12" (১ বর্গফুট)' },
      '16x16': { w: 16, h: 16, label: '16" × 16" (১.৭৮ বর্গফুট)' },
      '24x24': { w: 24, h: 24, label: '24" × 24" (৪ বর্গফুট)' },
      '32x32': { w: 32, h: 32, label: '32" × 32" (৭.১১ বর্গফুট)' },
      '12x24': { w: 12, h: 24, label: '12" × 24" (২ বর্গফুট)' }
    };

    const current = dimensions[tilesSize] || dimensions['12x12'];
    const singleTileAreaSqft = (current.w * current.h) / 144;
    
    // Add 8% for cutting, waste & pattern matching
    const totalAreaWithWastage = a * 1.08;
    const totalTilesCount = Math.ceil(totalAreaWithWastage / singleTileAreaSqft);
    const totalCost = a * price;

    return {
      totalTilesCount,
      singleTileAreaSqft,
      totalCost,
      label: current.label,
      areaWithWastage: totalAreaWithWastage
    };
  };

  const results = calculateTiles();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">টাইলস হিসাব ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">মেঝে বা দেয়ালে প্রয়োজনীয় টাইলসের সংখ্যা ও খরচ বের করুন</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">মোট ফ্লোর/দেয়ালের এরিয়া</label>
            <input 
              type="number" 
              value={area || ""} 
              onChange={e => setArea(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-teal-500" 
              placeholder="বর্গফুট লিখুন" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">টাইলসের সাইজ</label>
            <select 
              value={tilesSize || ""} 
              onChange={e => setTilesSize(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-teal-500"
            >
              <option value="12x12">12" × 12" (Floor/Wall)</option>
              <option value="16x16">16" × 16" (Floor)</option>
              <option value="24x24">24" × 24" (Premium Floor)</option>
              <option value="32x32">32" × 32" (Large Floor)</option>
              <option value="12x24">12" × 24" (Kitchen/Bathroom Wall)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">প্রতি বর্গফুট টাইলসের গড় দাম (৳)</label>
          <input 
            type="number" 
            value={pricePerSqft || ""} 
            onChange={e => setPricePerSqft(e.target.value)} 
            className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-teal-500" 
            placeholder="৮০" 
          />
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6 space-y-4">
          <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-5 text-center">
            <p className="text-xs font-bold text-teal-800">মোট টাইলস লাগবে (৮% অপচয়সহ)</p>
            <p className="text-3xl font-black text-teal-700 mt-1">
              {results.totalTilesCount.toLocaleString('en-IN')} টি
            </p>
            <p className="text-[12px] font-bold text-slate-500 mt-1">
              একটি টাইলসের ক্ষেত্রফল: {results.singleTileAreaSqft.toFixed(2)} বর্গফুট
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center text-xs font-bold text-slate-600">
            <span>টাইলসের আনুমানিক খরচ:</span>
            <span className="text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-full text-sm font-black">
              ৳ {results.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Roof Concrete Calculator (ছাদের কংক্রিট হিসাব) ----------------
function RoofConcreteCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [thickness, setThickness] = useState('5'); // in inches, standard 5
  const [mixRatio, setMixRatio] = useState('1:1.5:3'); // 1:1.5:3, 1:2:4, 1:3:6
  const [steelPercent, setSteelPercent] = useState('1.2'); // steel density, standard 1.2%
  
  const [cementPrice, setCementPrice] = useState('550');
  const [sandPrice, setSandPrice] = useState('45');
  const [stonePrice, setStonePrice] = useState('120'); // stone chips or brick khoa
  const [rodPrice, setRodPrice] = useState('95'); // per kg

  const calculateRoof = () => {
    const l = Number(length) || 0;
    const w = Number(width) || 0;
    const t = Number(thickness) || 5;
    const ratioStr = mixRatio;
    const steelP = Number(steelPercent) || 1.2;

    const pCement = Number(cementPrice) || 0;
    const pSand = Number(sandPrice) || 0;
    const pStone = Number(stonePrice) || 0;
    const pRod = Number(rodPrice) || 0;

    // 1. Wet Volume (CFT)
    const wetVolume = (l * w * (t / 12));
    
    // 2. Dry Volume (CFT) - Concrete shrinks when wet. Dry volume factor is 1.54
    const dryVolume = wetVolume * 1.54;

    // Parse mix ratio
    const ratios = ratioStr.split(':').map(Number);
    const sumParts = ratios.reduce((acc, val) => acc + val, 0);

    // Dry volume split
    const cementCft = (dryVolume * ratios[0]) / sumParts;
    const sandCft = (dryVolume * ratios[1]) / sumParts;
    const stoneCft = (dryVolume * ratios[2]) / sumParts;

    // 1 bag of cement = 1.25 CFT
    const cementBags = Math.ceil(cementCft / 1.25);
    const sandCftRound = Math.ceil(sandCft);
    const stoneCftRound = Math.ceil(stoneCft);

    // Steel Rod weight (kg)
    // Formula: Weight of steel = Volume of concrete (wet) * Steel% * Density of steel
    // Density of steel = 490 lbs/cft = 7850 kg/m3. 
    // 1 cft steel = 7.85 kg (approx) or accurate 222.26 kg.
    const rodKg = Math.ceil(wetVolume * (steelP / 100) * 222.26);

    // Costs
    const costCement = cementBags * pCement;
    const costSand = sandCftRound * pSand;
    const costStone = stoneCftRound * pStone;
    const costRod = rodKg * pRod;
    const totalCost = costCement + costSand + costStone + costRod;

    return {
      wetVolume,
      dryVolume,
      cementBags,
      sandCft: sandCftRound,
      stoneCft: stoneCftRound,
      rodKg,
      costCement,
      costSand,
      costStone,
      costRod,
      totalCost
    };
  };

  const results = calculateRoof();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">ছাদের কংক্রিট ও রড হিসাব</h2>
          <p className="text-xs text-gray-500">ছাদ ঢালাইয়ে সিমেন্ট, বালি, খোয়া এবং রডের সম্পূর্ণ হিসাব</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specifications */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-teal-600 mb-2 flex items-center gap-2">
            🏗️ ছাদের পরিমাপ ও অনুপাত
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ছাদের দৈর্ঘ্য (ফুট)</label>
              <input 
                type="number" 
                value={length || ""} 
                onChange={e => setLength(e.target.value)} 
                className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm focus:ring-teal-500" 
                placeholder="দৈর্ঘ্য" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ছাদের প্রস্থ (ফুট)</label>
              <input 
                type="number" 
                value={width || ""} 
                onChange={e => setWidth(e.target.value)} 
                className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm focus:ring-teal-500" 
                placeholder="প্রস্থ" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ছাদের পুরুত্ব (ইঞ্চি)</label>
              <input 
                type="number" 
                value={thickness || ""} 
                onChange={e => setThickness(e.target.value)} 
                className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm focus:ring-teal-500" 
                placeholder="৫" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ঢালাইয়ের অনুপাত (Cement:Sand:Stone)</label>
              <select 
                value={mixRatio || ""} 
                onChange={e => setMixRatio(e.target.value)} 
                className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm focus:ring-teal-500"
              >
                <option value="1:1.5:3">১:১.৫:৩ (স্ট্যান্ডার্ড ছাদ ঢালাই)</option>
                <option value="1:2:4">১:২:৪ (সাধারণ ঢালাই)</option>
                <option value="1:3:6">১:৩:৬ (হালকা প্যাটকো)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">রডের অনুপাত (Steel Ratio: ১.০% থেকে ১.৫%)</label>
            <select 
              value={steelPercent || ""} 
              onChange={e => setSteelPercent(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm focus:ring-teal-500"
            >
              <option value="1.0">১.০ % রড (ন্যূনতম)</option>
              <option value="1.2">১.২ % রড (স্ট্যান্ডার্ড)</option>
              <option value="1.5">১.৫ % রড (উচ্চ রেইনফোর্সমেন্ট)</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-teal-600 mb-2 flex items-center gap-2">
            💰 কাঁচামালের বাজার মূল্য
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">সিমেন্ট (প্রতি ব্যাগ ৳)</label>
              <input type="number" value={cementPrice || ""} onChange={e => setCementPrice(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="৫৫০" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">বালু (প্রতি CFT ৳)</label>
              <input type="number" value={sandPrice || ""} onChange={e => setSandPrice(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="৪৫" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">খোয়া/পাথর (প্রতি CFT ৳)</label>
              <input type="number" value={stonePrice || ""} onChange={e => setStonePrice(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="১২০" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">রড (প্রতি কেজি ৳)</label>
              <input type="number" value={rodPrice || ""} onChange={e => setRodPrice(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="৯৫" />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3">ঢালাইয়ের আনুমানিক প্রয়োজনীয় মালামাল ও খরচ</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">সিমেন্ট</span>
            <p className="text-2xl font-black text-emerald-700 mt-2">{results.cementBags} ব্যাগ</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">খরচ: ৳ {results.costCement.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-100">
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">বালি</span>
            <p className="text-2xl font-black text-amber-700 mt-2">{results.sandCft} CFT</p>
            <p className="text-[10px] text-amber-600 font-bold mt-1">খরচ: ৳ {results.costSand.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-orange-50 rounded-2xl p-4 text-center border border-orange-100">
            <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">খোয়া/পাথর</span>
            <p className="text-2xl font-black text-orange-700 mt-2">{results.stoneCft} CFT</p>
            <p className="text-[10px] text-orange-600 font-bold mt-1">খরচ: ৳ {results.costStone.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
            <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">রড</span>
            <p className="text-2xl font-black text-blue-700 mt-2">{results.rodKg} কেজি</p>
            <p className="text-[10px] text-blue-600 font-bold mt-1">খরচ: ৳ {results.costRod.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 text-center mt-4">
          <p className="text-xs font-bold text-teal-800">ছাদ ঢালাইয়ের আনুমানিক মোট খরচ</p>
          <p className="text-3xl font-black text-teal-700 mt-1">
            ৳ {results.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] font-bold text-slate-500 mt-1">
            মোট আয়তন: {results.wetVolume.toFixed(1)} CFT (ঘনফুট) | শুকনো আয়তন (Dry Vol): {results.dryVolume.toFixed(1)} CFT
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------- Age Calculator ----------------
function AgeCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [dob, setDob] = useState('');
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split('T')[0]);

  const calculateAge = () => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const endDate = new Date(targetDate);
    
    let years = endDate.getFullYear() - birthDate.getFullYear();
    let months = endDate.getMonth() - birthDate.getMonth();
    let days = endDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years < 0) return null;

    return { years, months, days };
  };

  const age = calculateAge();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">বয়স ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">জন্মতারিখ থেকে নির্ভুল বয়স বের করুন</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">জন্মতারিখ</label>
          <input type="date" value={dob || ""} onChange={e => setDob(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">যেই তারিখ পর্যন্ত</label>
          <input type="date" value={targetDate || ""} onChange={e => setTargetDate(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3" />
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6 grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-blue-600">{age ? age.years : '--'}</p>
            <p className="text-xs text-blue-800 font-bold mt-1">বছর</p>
          </div>
          <div className="bg-indigo-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-indigo-600">{age ? age.months : '--'}</p>
            <p className="text-xs text-indigo-800 font-bold mt-1">মাস</p>
          </div>
          <div className="bg-sky-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-sky-600">{age ? age.days : '--'}</p>
            <p className="text-xs text-sky-800 font-bold mt-1">দিন</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- BMI Calculator ----------------
function BmiCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [weight, setWeight] = useState('');

  const calculateBmi = () => {
    const f = Number(feet) || 0;
    const i = Number(inches) || 0;
    const w = Number(weight) || 0;

    if (w <= 0 || (f === 0 && i === 0)) return null;

    const heightInMeters = ((f * 12) + i) * 0.0254;
    const bmi = w / (heightInMeters * heightInMeters);
    
    let status = '';
    let color = '';
    if (bmi < 18.5) { status = 'ওজন কম'; color = 'text-amber-500'; }
    else if (bmi < 25) { status = 'স্বাভাবিক'; color = 'text-emerald-500'; }
    else if (bmi < 30) { status = 'ওজন বেশি'; color = 'text-orange-500'; }
    else { status = 'স্থূলতা'; color = 'text-rose-500'; }

    return { bmi: bmi.toFixed(1), status, color };
  };

  const result = calculateBmi();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">BMI ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">উচ্চতা ও ওজন অনুযায়ী আপনার স্বাস্থ্য সূচক</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">উচ্চতা (ফুট)</label>
            <input type="number" value={feet || ""} onChange={e => setFeet(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3" placeholder="যেমন: ৫" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">উচ্চতা (ইঞ্চি)</label>
            <input type="number" value={inches || ""} onChange={e => setInches(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3" placeholder="যেমন: ৬" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">ওজন (কেজি)</label>
          <input type="number" value={weight || ""} onChange={e => setWeight(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3" placeholder="যেমন: ৬৫" />
        </div>

        {result && (
          <div className="pt-4 border-t border-gray-100 mt-6 text-center">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <p className="text-sm font-bold text-gray-500 mb-2">আপনার BMI স্কোর</p>
              <p className={`text-4xl font-black mb-2 ${result.color}`}>{result.bmi}</p>
              <p className={`text-lg font-bold ${result.color}`}>{result.status}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- Paint Calculator ----------------
function PaintCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [coats, setCoats] = useState('2');

  const calculatePaint = () => {
    const l = Number(length) || 0;
    const h = Number(height) || 0;
    const c = Number(coats) || 1;

    const sqFt = l * h;
    // Assume 1 liter of paint covers ~120 sqft for 1 coat
    const coveragePerLiter = 120;
    const liters = (sqFt * c) / coveragePerLiter;

    return {
      sqFt,
      liters: liters.toFixed(1)
    };
  };

  const result = calculatePaint();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 hover:bg-sky-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">রং (Paint) ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">দেয়ালের মাপ অনুযায়ী কতটুকু রং লাগবে</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">দেয়ালের দৈর্ঘ্য (ফুট)</label>
            <input type="number" value={length || ""} onChange={e => setLength(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3" placeholder="যেমন: ১২" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">দেয়ালের উচ্চতা (ফুট)</label>
            <input type="number" value={height || ""} onChange={e => setHeight(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3" placeholder="যেমন: ১০" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">কোট (Coats) সংখ্যা</label>
          <select value={coats || ""} onChange={e => setCoats(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-3">
            <option value="1">১ কোট</option>
            <option value="2">২ কোট</option>
            <option value="3">৩ কোট</option>
          </select>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-gray-700">{result.sqFt}</p>
            <p className="text-xs text-gray-500 font-bold mt-1">মোট বর্গফুট</p>
          </div>
          <div className="bg-sky-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-sky-600">{result.liters}</p>
            <p className="text-xs text-sky-800 font-bold mt-1">রং লাগবে (লিটার)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Unit Converter ----------------
function UnitConverter({ onGoBack }: { onGoBack: () => void }) {
  const [val, setVal] = useState('1');
  const [type, setType] = useState('length'); // length, weight, temp, volume, electricity, storage
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('cm');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const categories = [
    { id: 'temp', label: 'তাপমাত্রা', sub: 'Temperature', icon: <Thermometer className="w-5 h-5 text-amber-500" /> },
    { id: 'length', label: 'দৈর্ঘ্য', sub: 'Length', icon: <Ruler className="w-5 h-5 text-indigo-500" /> },
    { id: 'weight', label: 'ওজন', sub: 'Weight', icon: <Scale className="w-5 h-5 text-emerald-500" /> },
    { id: 'volume', label: 'আয়তন', sub: 'Volume', icon: <Droplet className="w-5 h-5 text-sky-500" /> },
    { id: 'electricity', label: 'বিদ্যুৎ ইউনিট', sub: 'Electricity/Energy', icon: <Zap className="w-5 h-5 text-yellow-500" /> },
    { id: 'storage', label: 'ডাটা স্টোরেজ', sub: 'Data Storage', icon: <Database className="w-5 h-5 text-purple-500" /> }
  ];

  const units: Record<string, { id: string; label: string; sub: string }[]> = {
    temp: [
      { id: 'c', label: 'সেলসিয়াস', sub: 'Celsius (°C)' },
      { id: 'f', label: 'ফারেনহাইট', sub: 'Fahrenheit (°F)' },
      { id: 'k', label: 'কেলভিন', sub: 'Kelvin (K)' }
    ],
    length: [
      { id: 'cm', label: 'সেন্টিমিটার', sub: 'Centimeter (cm)' },
      { id: 'meter', label: 'মিটার', sub: 'Meter (m)' },
      { id: 'km', label: 'কালোমিটার', sub: 'Kilometer (km)' },
      { id: 'inch', label: 'ইঞ্চি', sub: 'Inch (in)' },
      { id: 'foot', label: 'ফুট', sub: 'Foot (ft)' },
      { id: 'yard', label: 'গজ', sub: 'Yard (yd)' },
      { id: 'mile', label: 'মাইল', sub: 'Mile (mi)' }
    ],
    weight: [
      { id: 'gram', label: 'গ্রাম', sub: 'Gram (g)' },
      { id: 'kg', label: 'কিলোগ্রাম', sub: 'Kilogram (kg)' },
      { id: 'pound', label: 'পাউন্ড', sub: 'Pound (lb)' },
      { id: 'ton', label: 'টন', sub: 'Ton (t)' },
      { id: 'ounce', label: 'আউন্স', sub: 'Ounce (oz)' },
      { id: 'maund', label: 'মন', sub: 'Maund (≈37.3 kg)' },
      { id: 'tola', label: 'তোলা', sub: 'Tola (≈11.66 g)' }
    ],
    volume: [
      { id: 'ml', label: 'মিলিলিটার', sub: 'Milliliter (ml)' },
      { id: 'liter', label: 'লিটার', sub: 'Liter (L)' },
      { id: 'cubic_meter', label: 'ঘনমিটার', sub: 'Cubic Meter (m³)' },
      { id: 'gallon', label: 'গ্যালন', sub: 'Gallon (US gal)' },
      { id: 'cup', label: 'কাপ', sub: 'Cup (US cup)' },
      { id: 'fl_oz', label: 'তরল আউন্স', sub: 'Fluid Ounce (fl oz)' }
    ],
    electricity: [
      { id: 'wh', label: 'ওয়াট-ঘণ্টা', sub: 'Watt-hour (Wh)' },
      { id: 'kwh', label: 'কিলোওয়াট-ঘণ্টা (ইউনিট)', sub: 'kWh (Unit)' },
      { id: 'mwh', label: 'মেগাওয়াট-ঘণ্টা', sub: 'Megawatt-hour (MWh)' },
      { id: 'joule', label: 'জুল', sub: 'Joule (J)' },
      { id: 'btu', label: 'বিটিইউ', sub: 'BTU' },
      { id: 'hph', label: 'অশ্বশক্তি-ঘণ্টা', sub: 'Horsepower-hour (hp·h)' }
    ],
    storage: [
      { id: 'b', label: 'বাইট', sub: 'Byte (B)' },
      { id: 'kb', label: 'কিলোবাইট', sub: 'Kilobyte (KB)' },
      { id: 'mb', label: 'মেগাবাইট', sub: 'Megabyte (MB)' },
      { id: 'gb', label: 'গিগাবাইট', sub: 'Gigabyte (GB)' },
      { id: 'tb', label: 'টেরাবাইট', sub: 'Terabyte (TB)' }
    ]
  };

  const convertValue = (v: number, from: string, to: string, cat: string): number => {
    if (isNaN(v)) return 0;
    
    if (cat === 'temp') {
      if (from === to) return v;
      let cVal = v;
      if (from === 'f') cVal = (v - 32) * 5/9;
      if (from === 'k') cVal = v - 273.15;
      
      if (to === 'c') return cVal;
      if (to === 'f') return (cVal * 9/5) + 32;
      if (to === 'k') return cVal + 273.15;
      return v;
    }

    if (cat === 'length') {
      const factors: Record<string, number> = {
        cm: 0.01, meter: 1, km: 1000, inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344
      };
      const base = v * (factors[from] || 1);
      return base / (factors[to] || 1);
    }

    if (cat === 'weight') {
      const factors: Record<string, number> = {
        gram: 0.001, kg: 1, pound: 0.45359237, ton: 1000, ounce: 0.028349523, maund: 37.3242, tola: 0.0116638
      };
      const base = v * (factors[from] || 1);
      return base / (factors[to] || 1);
    }

    if (cat === 'volume') {
      const factors: Record<string, number> = {
        ml: 0.001, liter: 1, cubic_meter: 1000, gallon: 3.785411784, cup: 0.2365882365, fl_oz: 0.0295735295
      };
      const base = v * (factors[from] || 1);
      return base / (factors[to] || 1);
    }

    if (cat === 'electricity') {
      const factors: Record<string, number> = {
        wh: 0.001, kwh: 1, mwh: 1000, joule: 2.7777777777778e-7, btu: 0.00029307107, hph: 0.745699872
      };
      const base = v * (factors[from] || 1);
      return base / (factors[to] || 1);
    }

    if (cat === 'storage') {
      const factors: Record<string, number> = {
        b: 1 / (1024 * 1024 * 1024),
        kb: 1 / (1024 * 1024),
        mb: 1 / 1024,
        gb: 1,
        tb: 1024
      };
      const base = v * (factors[from] || 1);
      return base / (factors[to] || 1);
    }

    return v;
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleCategoryChange = (catId: string) => {
    setType(catId);
    const catUnits = units[catId];
    if (catUnits && catUnits.length >= 2) {
      setFromUnit(catUnits[1].id); // second unit usually standard/base
      setToUnit(catUnits[0].id); // first unit usually smaller
    }
  };

  const formatResult = (num: number): string => {
    if (num === 0) return '0';
    if (Math.abs(num) < 0.0001 || Math.abs(num) > 10000000) {
      return num.toExponential(4);
    }
    // Round to max 6 decimals and strip trailing zeros
    return parseFloat(num.toFixed(6)).toString();
  };

  const vNum = Number(val) || 0;
  const convertedResult = convertValue(vNum, fromUnit, toUnit, type);

  const handleCopy = async (text: string, index: string) => {
    await copyToClipboard(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      {/* Header Panel */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-[#009664]/10 flex items-center justify-center text-[#009664] hover:bg-[#009664] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-800">সার্বজনীন রূপান্তরকারী (Unit Converter)</h2>
            <p className="text-xs text-slate-500 font-bold">দৈর্ঘ্য, ওজন, তাপমাত্রা, বিদ্যুৎ ইউনিট, আয়তন এবং ডাটা স্টোরেজ রূপান্তর করুন</p>
          </div>
        </div>
      </div>

      {/* Categories Grid Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const isActive = type === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                isActive 
                  ? 'bg-emerald-50/80 border-emerald-500 text-emerald-800 shadow-sm font-black' 
                  : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50 font-bold'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-emerald-500/20' : 'bg-slate-50'}`}>
                {cat.icon}
              </div>
              <div>
                <p className="text-[13px]">{cat.label}</p>
                <p className="text-[10px] text-slate-400 font-normal">{cat.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Converter Card */}
      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Input Unit & Value */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <label className="block text-[12px] font-black text-slate-500 mb-1.5">কোন একক হতে (From Unit)</label>
              <select 
                value={fromUnit || ""} 
                onChange={e => setFromUnit(e.target.value)} 
                className="w-full border border-slate-200 rounded-xl bg-slate-50 p-3 text-[14px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {(units[type] || []).map(u => (
                  <option key={u.id} value={u.id || ""}>{u.label} — {u.sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-black text-slate-500 mb-1.5">রূপান্তরযোগ্য মান (Value)</label>
              <input 
                type="number" 
                value={val || ""} 
                onChange={e => setVal(e.target.value)} 
                className="w-full border border-slate-200 rounded-xl bg-slate-50 p-3 text-[16px] font-black text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                placeholder="মান লিখুন" 
              />
            </div>
          </div>

          {/* Swap Button Column */}
          <div className="md:col-span-2 flex items-center justify-center pt-2 md:pt-6">
            <button 
              onClick={handleSwap}
              title="একক পরিবর্তন করুন"
              className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 transition-all flex items-center justify-center shadow-sm hover:scale-105 active:scale-95"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Output Unit & Value */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <label className="block text-[12px] font-black text-slate-500 mb-1.5">কোন এককে রূপান্তর (To Unit)</label>
              <select 
                value={toUnit || ""} 
                onChange={e => setToUnit(e.target.value)} 
                className="w-full border border-slate-200 rounded-xl bg-slate-50 p-3 text-[14px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {(units[type] || []).map(u => (
                  <option key={u.id} value={u.id || ""}>{u.label} — {u.sub}</option>
                ))}
              </select>
            </div>

            {/* Real-time result panel with copy button */}
            <div className="relative">
              <label className="block text-[12px] font-black text-slate-500 mb-1.5">রূপান্তরিত ফলাফল (Result)</label>
              <div className="w-full border border-emerald-100 bg-emerald-50/40 rounded-xl p-3 flex items-center justify-between min-h-[46px]">
                <span className="text-[16px] font-black text-emerald-800 break-all select-all">
                  {formatResult(convertedResult)}
                </span>
                <button
                  onClick={() => handleCopy(formatResult(convertedResult), 'main')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center gap-1 shrink-0 ml-2"
                >
                  {copiedIndex === 'main' ? 'কপি হয়েছে' : 'কপি করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Formula Tip */}
        <div className="mt-5 p-3.5 bg-slate-50 border border-slate-100/60 rounded-xl text-center">
          <p className="text-[12px] font-bold text-slate-500">
            সূত্র: <span className="text-emerald-700 font-black">{val || '0'} {units[type]?.find(u => u.id === fromUnit)?.label}</span> = <span className="text-emerald-700 font-black">{formatResult(convertedResult)} {units[type]?.find(u => u.id === toUnit)?.label}</span>
          </p>
        </div>
      </div>

      {/* ALL UNITS MATRIX (তাত্ক্ষণিক রূপান্তর তালিকা) */}
      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[14px] font-black text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            অন্যান্য সকল এককে তাত্ক্ষণিক রূপান্তর তালিকা (Conversion Matrix)
          </h4>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {val || '0'} {units[type]?.find(u => u.id === fromUnit)?.label} হতে
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(units[type] || []).map((targetUnit) => {
            const result = convertValue(vNum, fromUnit, targetUnit.id, type);
            const formatted = formatResult(result);
            const isSelf = targetUnit.id === fromUnit;

            return (
              <div 
                key={targetUnit.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isSelf 
                    ? 'bg-emerald-500/5 border-emerald-200 shadow-sm' 
                    : 'bg-slate-50/50 border-slate-100/80 hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="text-[11px] font-black text-slate-400">{targetUnit.label}</p>
                  <p className="text-[13px] font-black text-slate-800 truncate" title={formatted}>
                    {formatted}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 truncate">{targetUnit.sub}</p>
                </div>

                <button
                  onClick={() => handleCopy(formatted, targetUnit.id)}
                  className={`text-[10px] font-black px-2 py-1 rounded-lg transition-all shrink-0 ${
                    copiedIndex === targetUnit.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
                  }`}
                >
                  {copiedIndex === targetUnit.id ? 'কপিড' : 'কপি'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------- Fertilizer Calculator ----------------
function FertilizerCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [landSize, setLandSize] = useState('');
  const [landUnit, setLandUnit] = useState('decimal'); // decimal, bigha, acre
  const [crop, setCrop] = useState('rice');

  const getDecimalSize = () => {
    const size = Number(landSize) || 0;
    if (landUnit === 'bigha') return size * 33;
    if (landUnit === 'acre') return size * 100;
    return size;
  };

  const calculateFertilizer = () => {
    const decimalSize = getDecimalSize();
    
    // Rates per decimal (in kg)
    const rates: Record<string, { urea: number, tsp: number, mop: number, gypsum: number }> = {
      rice: { urea: 0.8, tsp: 0.4, mop: 0.3, gypsum: 0.2 },
      wheat: { urea: 0.7, tsp: 0.5, mop: 0.35, gypsum: 0.25 },
      potato: { urea: 1.2, tsp: 0.9, mop: 1.0, gypsum: 0.4 },
      maize: { urea: 1.5, tsp: 0.8, mop: 0.6, gypsum: 0.4 },
      mustard: { urea: 0.5, tsp: 0.35, mop: 0.25, gypsum: 0.3 }
    };

    const rate = rates[crop] || rates.rice;

    return {
      urea: decimalSize * rate.urea,
      tsp: decimalSize * rate.tsp,
      mop: decimalSize * rate.mop,
      gypsum: decimalSize * rate.gypsum
    };
  };

  const results = calculateFertilizer();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">সার পরিমাপ ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">ফসলের ধরন ও জমির পরিমাপ অনুযায়ী প্রয়োজনীয় সারের হিসাব</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">জমির পরিমাণ</label>
            <input 
              type="number" 
              value={landSize || ""} 
              onChange={e => setLandSize(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-emerald-500" 
              placeholder="পরিমাণ লিখুন" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">একক</label>
            <select 
              value={landUnit || ""} 
              onChange={e => setLandUnit(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3"
            >
              <option value="decimal">শতক (Decimal)</option>
              <option value="bigha">বিঘা (Bigha = ৩৩ শতক)</option>
              <option value="acre">একর (Acre = ১০০ শতক)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">ফসলের ধরন</label>
          <select 
            value={crop || ""} 
            onChange={e => setCrop(e.target.value)} 
            className="w-full border-gray-200 rounded-xl bg-gray-50 p-3"
          >
            <option value="rice">ধান (Rice)</option>
            <option value="wheat">গম (Wheat)</option>
            <option value="potato">আলু (Potato)</option>
            <option value="maize">ভুট্টা (Maize)</option>
            <option value="mustard">সরিষা (Mustard)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6">
          <h3 className="text-base font-black text-slate-800 mb-4 text-center">প্রয়োজনীয় সারের মোট পরিমাণ</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 text-center">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">ইউরিয়া</span>
              <p className="text-2xl font-black text-emerald-700 mt-2">{results.urea.toFixed(2)} কেজি</p>
            </div>
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 text-center">
              <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">টিএসপি (TSP)</span>
              <p className="text-2xl font-black text-blue-700 mt-2">{results.tsp.toFixed(2)} কেজি</p>
            </div>
            <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50 text-center">
              <span className="text-xs font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">এমওপি/পটাশ</span>
              <p className="text-2xl font-black text-orange-700 mt-2">{results.mop.toFixed(2)} কেজি</p>
            </div>
            <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100/50 text-center">
              <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">জিপসাম</span>
              <p className="text-2xl font-black text-purple-700 mt-2">{results.gypsum.toFixed(2)} কেজি</p>
            </div>
          </div>
          
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800 leading-relaxed font-semibold">
            ℹ️ পরামর্শ: সারের ব্যবহার মাটির উর্বরতা ও আবহাওয়া অনুযায়ী পরিবর্তিত হতে পারে। সঠিক পরিমাপের জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করতে পারেন।
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Seed Calculator ----------------
function SeedCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [landSize, setLandSize] = useState('');
  const [landUnit, setLandUnit] = useState('decimal');
  const [crop, setCrop] = useState('boro_rice');

  const getDecimalSize = () => {
    const size = Number(landSize) || 0;
    if (landUnit === 'bigha') return size * 33;
    if (landUnit === 'acre') return size * 100;
    return size;
  };

  const calculateSeed = () => {
    const decimalSize = getDecimalSize();
    
    // Seed rate per decimal in kg, spacing details, depth
    const data: Record<string, { rate: number, depth: string, rowSpacing: string, plantSpacing: string }> = {
      boro_rice: { rate: 0.15, depth: '২ - ৩ সেমি', rowSpacing: '২০ সেমি', plantSpacing: '১৫ সেমি' },
      aman_rice: { rate: 0.12, depth: '২ - ৩ সেমি', rowSpacing: '২০ সেমি', plantSpacing: '১৫ সেমি' },
      wheat: { rate: 0.5, depth: '৩ - ৫ সেমি', rowSpacing: '২০ সেমি', plantSpacing: 'পরপর (Continuous)' },
      potato: { rate: 6.0, depth: '৫ - ৭ সেমি', rowSpacing: '৬০ সেমি', plantSpacing: '২৫ সেমি' },
      mustard: { rate: 0.035, depth: '২ - ৩ সেমি', rowSpacing: '৩০ সেমি', plantSpacing: '১০ সেমি' },
      maize: { rate: 0.1, depth: '৩ - ৫ সেমি', rowSpacing: '৬০ সেমি', plantSpacing: '২৫ সেমি' }
    };

    const info = data[crop] || data.boro_rice;
    return {
      totalSeed: decimalSize * info.rate,
      depth: info.depth,
      rowSpacing: info.rowSpacing,
      plantSpacing: info.plantSpacing
    };
  };

  const results = calculateSeed();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">বীজ পরিমাণ ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">জমির আকার অনুযায়ী বপনযোগ্য বীজের সঠিক পরিমাণ</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">জমির পরিমাণ</label>
            <input 
              type="number" 
              value={landSize || ""} 
              onChange={e => setLandSize(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-teal-500" 
              placeholder="পরিমাণ লিখুন" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">একক</label>
            <select 
              value={landUnit || ""} 
              onChange={e => setLandUnit(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3"
            >
              <option value="decimal">শতক (Decimal)</option>
              <option value="bigha">বিঘা (Bigha = ৩৩ শতক)</option>
              <option value="acre">একর (Acre = ১০০ শতক)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">ফসলের ধরন</label>
          <select 
            value={crop || ""} 
            onChange={e => setCrop(e.target.value)} 
            className="w-full border-gray-200 rounded-xl bg-gray-50 p-3"
          >
            <option value="boro_rice">বোরো ধান (Boro Rice)</option>
            <option value="aman_rice">আমন ধান (Aman Rice)</option>
            <option value="wheat">গম (Wheat)</option>
            <option value="potato">আলু বীজ (Potato Tuber)</option>
            <option value="mustard">সরিষা (Mustard)</option>
            <option value="maize">ভুট্টা (Maize)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6">
          <div className="bg-teal-50 rounded-2xl p-6 text-center mb-5">
            <p className="text-sm font-bold text-teal-800 mb-2">মোট প্রয়োজনীয় বীজ</p>
            <p className="text-3xl font-black text-teal-700">
              {results.totalSeed >= 1 ? `${results.totalSeed.toFixed(2)} কেজি` : `${(results.totalSeed * 1000).toFixed(0)} গ্রাম`}
            </p>
          </div>

          <h3 className="text-sm font-black text-slate-800 mb-3">রোপণ ও রোপণ দূরত্ব নির্দেশিকা</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">বপনের গভীরতা</span>
              <span className="text-xs font-black text-slate-700">{results.depth}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">সারির দূরত্ব</span>
              <span className="text-xs font-black text-slate-700">{results.rowSpacing}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">চারার দূরত্ব</span>
              <span className="text-xs font-black text-slate-700">{results.plantSpacing}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Irrigation Water Calculator ----------------
function IrrigationCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [landSize, setLandSize] = useState('');
  const [landUnit, setLandUnit] = useState('decimal');
  const [soilType, setSoilType] = useState('loamy'); // sandy, loamy, clayey
  const [crop, setCrop] = useState('rice');
  const [pumpType, setPumpType] = useState('diesel'); // diesel, electric

  const getDecimalSize = () => {
    const size = Number(landSize) || 0;
    if (landUnit === 'bigha') return size * 33;
    if (landUnit === 'acre') return size * 100;
    return size;
  };

  const calculateIrrigation = () => {
    const decimalSize = getDecimalSize();
    
    // Average baseline water depth in mm
    const cropWaterDepths: Record<string, number> = {
      rice: 50,
      wheat: 30,
      potato: 25,
      others: 20
    };

    const baseDepth = cropWaterDepths[crop] || 20;

    // Soil factors
    const soilFactors: Record<string, number> = {
      sandy: 1.2,
      loamy: 1.0,
      clayey: 0.85
    };
    const soilFactor = soilFactors[soilType] || 1.0;

    const netDepth = baseDepth * soilFactor; // mm depth
    // 1 mm depth on 1 decimal = 40.47 Liters
    const totalWaterLiters = decimalSize * netDepth * 40.47;

    // Pump runtime (36,000 Liters/hour discharge)
    const runtimeHours = totalWaterLiters / 36000;

    // Pump costs per hour in Taka
    const hourlyCost = pumpType === 'diesel' ? 120 : 50;
    const totalCost = runtimeHours * hourlyCost;

    return {
      totalWaterLiters,
      runtimeHours,
      totalCost
    };
  };

  const results = calculateIrrigation();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">সেচের পানির হিসাব</h2>
          <p className="text-xs text-gray-500">প্রয়োজনীয় পানির পরিমাণ, পাম্পের সময়কাল ও আনুমানিক ব্যয়</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">জমির পরিমাণ</label>
            <input 
              type="number" 
              value={landSize || ""} 
              onChange={e => setLandSize(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-blue-500" 
              placeholder="পরিমাণ লিখুন" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">একক</label>
            <select 
              value={landUnit || ""} 
              onChange={e => setLandUnit(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3"
            >
              <option value="decimal">শতক (Decimal)</option>
              <option value="bigha">বিঘা (Bigha = ৩৩ শতক)</option>
              <option value="acre">একর (Acre = ১০০ শতক)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">মাটির ধরন</label>
            <select 
              value={soilType || ""} 
              onChange={e => setSoilType(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3"
            >
              <option value="sandy">বেলে মাটি (Sandy)</option>
              <option value="loamy">দোআঁশ মাটি (Loamy)</option>
              <option value="clayey">এঁটেল মাটি (Clayey)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ফসলের ধরন</label>
            <select 
              value={crop || ""} 
              onChange={e => setCrop(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3"
            >
              <option value="rice">ধান (Rice)</option>
              <option value="wheat">গম (Wheat)</option>
              <option value="potato">আলু (Potato)</option>
              <option value="others">অন্যান্য (Others)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">সেচ পাম্পের ধরন</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setPumpType('diesel')}
              className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                pumpType === 'diesel' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              ডিজেল চালিত পাম্প
            </button>
            <button 
              onClick={() => setPumpType('electric')}
              className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                pumpType === 'electric' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              বৈদ্যুতিক পাম্প
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6 space-y-4">
          <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-5 text-center">
            <p className="text-xs font-bold text-blue-800">প্রয়োজনীয় পানির আনুমানিক পরিমাণ</p>
            <p className="text-3xl font-black text-blue-700 mt-1">
              {results.totalWaterLiters.toLocaleString('en-IN', { maximumFractionDigits: 0 })} লিটার
            </p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">
              ({(results.totalWaterLiters / 1000).toFixed(2)} ঘনমিটার / Cubic Meter)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
              <span className="text-xs font-bold text-slate-400">পাম্প চালানোর সময়</span>
              <p className="text-xl font-black text-slate-700 mt-1">{results.runtimeHours.toFixed(1)} ঘণ্টা</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
              <span className="text-xs font-bold text-slate-400">আনুমানিক বিদ্যুৎ/জ্বালানি খরচ</span>
              <p className="text-xl font-black text-slate-700 mt-1">৳ {results.totalCost.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Crop Yield Calculator ----------------
function CropYieldCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [landSize, setLandSize] = useState('');
  const [landUnit, setLandUnit] = useState('decimal');
  const [crop, setCrop] = useState('hyv_rice');

  const getDecimalSize = () => {
    const size = Number(landSize) || 0;
    if (landUnit === 'bigha') return size * 33;
    if (landUnit === 'acre') return size * 100;
    return size;
  };

  const calculateYield = () => {
    const decimalSize = getDecimalSize();

    // avg, min, max production per decimal in kg
    const yields: Record<string, { avg: number, min: number, max: number, label: string, period: string }> = {
      hyv_rice: { avg: 22.5, min: 20, max: 25, label: 'উচ্চ ফলনশীল ধান', period: '১২০ - ১৪৫ দিন' },
      local_rice: { avg: 12.5, min: 10, max: 15, label: 'স্থানীয় ধান', period: '১০০ - ১২০ দিন' },
      wheat: { avg: 14.0, min: 12, max: 16, label: 'গম', period: '১১০ - ১২৫ দিন' },
      potato: { avg: 90.0, min: 80, max: 100, label: 'আলু', period: '৮৫ - ৯০ দিন' },
      onion: { avg: 45.0, min: 40, max: 50, label: 'পেঁয়াজ', period: '১২ো - ১৩০ দিন' },
      maize: { avg: 37.5, min: 35, max: 40, label: 'ভুট্টা', period: '১৩০ - ১৪৫ দিন' }
    };

    const cropInfo = yields[crop] || yields.hyv_rice;

    const totalAvgKg = decimalSize * cropInfo.avg;
    const totalMinKg = decimalSize * cropInfo.min;
    const totalMaxKg = decimalSize * cropInfo.max;

    // Conversion: 40 kg = 1 Maund (মণ)
    return {
      totalAvgKg,
      totalAvgMaund: totalAvgKg / 40,
      totalMinMaund: totalMinKg / 40,
      totalMaxMaund: totalMaxKg / 40,
      period: cropInfo.period,
      cropLabel: cropInfo.label
    };
  };

  const results = calculateYield();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">ফসল উৎপাদন হিসাব</h2>
          <p className="text-xs text-gray-500">জমির পরিমাপ অনুযায়ী ফসলের উৎপাদন ও আনুমানিক ফলন হিসাব</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">জমির পরিমাণ</label>
            <input 
              type="number" 
              value={landSize || ""} 
              onChange={e => setLandSize(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-yellow-500" 
              placeholder="পরিমাণ লিখুন" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">একক</label>
            <select 
              value={landUnit || ""} 
              onChange={e => setLandUnit(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3"
            >
              <option value="decimal">শতক (Decimal)</option>
              <option value="bigha">বিঘা (Bigha = ৩৩ শতক)</option>
              <option value="acre">একর (Acre = ১০০ শতক)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">ফসলের ধরন</label>
          <select 
            value={crop || ""} 
            onChange={e => setCrop(e.target.value)} 
            className="w-full border-gray-200 rounded-xl bg-gray-50 p-3"
          >
            <option value="hyv_rice">উচ্চ ফলনশীল ধান (HYV Rice)</option>
            <option value="local_rice">স্থানীয় ধান (Local Rice)</option>
            <option value="wheat">গম (Wheat)</option>
            <option value="potato">আলু (Potato)</option>
            <option value="onion">পেঁয়াজ (Onion)</option>
            <option value="maize">ভুট্টা (Maize)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5 text-center">
            <p className="text-xs font-bold text-yellow-800">আনুমানিক গড় উৎপাদন</p>
            <p className="text-3xl font-black text-yellow-700 mt-1">
              {results.totalAvgMaund.toFixed(1)} মণ
            </p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">
              ({results.totalAvgKg.toLocaleString('en-IN', { maximumFractionDigits: 1 })} কেজি)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
              <span className="text-xs font-bold text-rose-500">সর্বনিম্ন ফলন</span>
              <p className="text-lg font-black text-slate-700 mt-1">{results.totalMinMaund.toFixed(1)} মণ</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
              <span className="text-xs font-bold text-emerald-600">সর্বোচ্চ ফলন</span>
              <p className="text-lg font-black text-slate-700 mt-1">{results.totalMaxMaund.toFixed(1)} মণ</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center text-xs font-bold text-slate-600">
            <span>ফসল সংগ্রহের আনুমানিক সময়কাল:</span>
            <span className="text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-full">{results.period}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Agri Profit/Loss Calculator ----------------
function AgriProfitCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [prepCost, setPrepCost] = useState('');
  const [seedCost, setSeedCost] = useState('');
  const [fertilizerCost, setFertilizerCost] = useState('');
  const [irrigationCost, setIrrigationCost] = useState('');
  const [pesticideCost, setPesticideCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [otherCost, setOtherCost] = useState('');

  const [yieldAmount, setYieldAmount] = useState(''); // in Maund (মণ)
  const [pricePerMaund, setPricePerMaund] = useState(''); // Taka per Maund
  const [byproductValue, setByproductValue] = useState(''); // Straw/others in Taka

  const calculateProfit = () => {
    const prep = Number(prepCost) || 0;
    const seed = Number(seedCost) || 0;
    const fertilizer = Number(fertilizerCost) || 0;
    const irrigation = Number(irrigationCost) || 0;
    const pesticide = Number(pesticideCost) || 0;
    const labor = Number(laborCost) || 0;
    const other = Number(otherCost) || 0;

    const totalExpense = prep + seed + fertilizer + irrigation + pesticide + labor + other;

    const yAmount = Number(yieldAmount) || 0;
    const price = Number(pricePerMaund) || 0;
    const byproduct = Number(byproductValue) || 0;

    const totalIncome = (yAmount * price) + byproduct;
    const netProfit = totalIncome - totalExpense;
    const roi = totalExpense > 0 ? (totalIncome / totalExpense) : 0;

    return {
      totalExpense,
      totalIncome,
      netProfit,
      roi
    };
  };

  const results = calculateProfit();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">কৃষি লাভ-লোকসান হিসাব</h2>
          <p className="text-xs text-gray-500">চাষাবাদের সার্বিক খরচ ও আয়ের বিপরীতে লাভ-লোকসান নির্ণয়</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-rose-600 flex items-center gap-2 mb-2">
            💸 চাষাবাদ খরচ (Taka)
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">জমি প্রস্তুত ও চাষ</label>
              <input type="number" value={prepCost || ""} onChange={e => setPrepCost(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">বীজ বা চারা ক্রয়</label>
              <input type="number" value={seedCost || ""} onChange={e => setSeedCost(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">সার প্রয়োগ</label>
              <input type="number" value={fertilizerCost || ""} onChange={e => setFertilizerCost(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">সেচ খরচ</label>
              <input type="number" value={irrigationCost || ""} onChange={e => setIrrigationCost(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">কীটনাশক ও পরিচর্যা</label>
              <input type="number" value={pesticideCost || ""} onChange={e => setPesticideCost(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">লেবার / শ্রমিক</label>
              <input type="number" value={laborCost || ""} onChange={e => setLaborCost(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">অন্যান্য খরচ</label>
              <input type="number" value={otherCost || ""} onChange={e => setOtherCost(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="0" />
            </div>
          </div>
        </div>

        {/* Income & Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-emerald-600 flex items-center gap-2 mb-2">
              🌾 ফলন ও সম্ভাব্য বিক্রয়
            </h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">মোট উৎপাদিত ফসল (মণ)</label>
              <input type="number" value={yieldAmount || ""} onChange={e => setYieldAmount(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="মণ-এ লিখুন" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">প্রতি মণের বাজার দর (৳)</label>
              <input type="number" value={pricePerMaund || ""} onChange={e => setPricePerMaund(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="টাকায় লিখুন" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">অন্যান্য বিক্রি (যেমন খড়/পাতা) (৳)</label>
              <input type="number" value={byproductValue || ""} onChange={e => setByproductValue(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="0" />
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800">লাভ-লোকসান সারসংক্ষেপ</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-rose-700 block">মোট খরচ</span>
                <span className="text-base font-black text-rose-800">৳ {results.totalExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-emerald-700 block">মোট সম্ভাব্য আয়</span>
                <span className="text-base font-black text-emerald-800">৳ {results.totalIncome.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className={`rounded-2xl p-5 text-center border ${
              results.netProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
            }`}>
              <span className={`text-xs font-bold block ${
                results.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'
              }`}>
                {results.netProfit >= 0 ? 'সম্ভাব্য নিট লাভ' : 'নিট লোকসান'}
              </span>
              <p className={`text-3xl font-black mt-1 ${
                results.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                ৳ {Math.abs(results.netProfit).toLocaleString('en-IN')}
              </p>
              {results.totalExpense > 0 && (
                <span className="text-[11px] font-bold text-slate-500 block mt-1">
                  বিনিয়োগের বিপরীতে আয়: {results.roi.toFixed(2)} গুণ
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Fitra Calculator (ফিতরা ক্যালকুলেটর) ----------------
function FitraCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [members, setMembers] = useState('1');
  const [fitraType, setFitraType] = useState('wheat');
  const [customPrice, setCustomPrice] = useState('115');

  const fitraRates: Record<string, { label: string, amount: number, quantity: string, defPrice: number }> = {
    wheat: { label: 'গম বা আটা (Wheat/Flour)', amount: 115, quantity: '১.৬৫ কেজি', defPrice: 115 },
    barley: { label: 'যব (Barley)', amount: 400, quantity: '৩.৩ কেজি', defPrice: 400 },
    dates: { label: 'খেজুর (Dates)', amount: 2000, quantity: '৩.৩ কেজি', defPrice: 2000 },
    raisins: { label: 'কিসমিস (Raisins)', amount: 2200, quantity: '৩.৩ কেজি', defPrice: 2200 },
    cheese: { label: 'পনির (Cheese)', amount: 2800, quantity: '৩.৩ কেজি', defPrice: 2800 },
  };

  // Sync default price when type changes
  React.useEffect(() => {
    if (fitraRates[fitraType]) {
      setCustomPrice(fitraRates[fitraType].defPrice.toString());
    }
  }, [fitraType]);

  const calculateFitra = () => {
    const count = Number(members) || 1;
    const price = Number(customPrice) || 0;
    const totalAmount = count * price;
    return {
      totalAmount,
      perPerson: price,
      quantityLabel: fitraRates[fitraType]?.quantity || '১.৬৫ কেজি',
    };
  };

  const results = calculateFitra();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#009664] hover:bg-[#009664] hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">ফিতরা ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">পরিবারের সদস্য সংখ্যা ও খাদ্যসামগ্রীর মূল্যে ফিতরা হিসাব</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">ফিতরার মাধ্যম (খাদ্যদ্রব্য)</label>
          <select 
            value={fitraType || ""} 
            onChange={e => setFitraType(e.target.value)} 
            className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-emerald-500"
          >
            {Object.entries(fitraRates).map(([key, value]) => (
              <option key={key} value={key || ""}>{value.label} - {value.quantity}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">পরিবারের মোট সদস্য সংখ্যা</label>
            <input 
              type="number" 
              value={members || ""} 
              onChange={e => setMembers(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-emerald-500" 
              placeholder="১" 
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">প্রতি জনের ফিতরা দর (৳)</label>
            <input 
              type="number" 
              value={customPrice || ""} 
              onChange={e => setCustomPrice(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 focus:ring-emerald-500" 
              placeholder="115" 
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center">
            <p className="text-xs font-bold text-emerald-800">মোট প্রদেয় ফিতরা</p>
            <p className="text-4xl font-black text-[#009664] mt-1">
              ৳ {results.totalAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-[12px] font-bold text-slate-500 mt-1">
              (জনপ্রতি ৳ {results.perPerson.toLocaleString('en-IN')} হিসেবে {results.quantityLabel} খাদ্যদ্রব্যের সমমূল্য)
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-[11px] text-slate-500 leading-relaxed font-semibold space-y-2">
            <p className="text-slate-800 font-bold text-xs">💡 ফিতরা সংক্রান্ত নিয়মাবলী ও বিধান:</p>
            <p>• ফিতরা বা সদকাতুল ফিতর সামর্থ্যবান প্রত্যেক মুসলমানের জন্য আদায় করা ওয়াজিব।</p>
            <p>• ঈদুল ফিতরের দিন সুবহে সাদিকের সময় যার নিকট জাকাতের নিساب পরিমাণ সম্পদ (সাড়ে সাত ভরি সোনা বা সাড়ে বায়ান্ন ভরি রুপা বা তার সমমূল্যের ব্যবসা সামগ্রী বা নগদ অর্থ) থাকবে, তার নিজের ও নাবালগ সন্তানদের পক্ষ থেকে ফিতরা আদায় করা ওয়াজিব।</p>
            <p>• গম বা আটা দ্বারা আদায় করলে জনপ্রতি সর্বনিম্ন ১ কেজি ৬৫০ গ্রাম বা তার বাজার মূল্য দিতে হবে। খেজুর, কিসমিস, যব বা পনির দ্বারা আদায় করলে জনপ্রতি ৩ কেজি ৩০০ গ্রাম বা তার বাজার মূল্য দিতে হবে।</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Inheritance Calculator (উত্তরাধিকার হিসাব) ----------------
function InheritanceCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [totalEstate, setTotalEstate] = useState('');
  const [deceasedGender, setDeceasedGender] = useState<'male' | 'female'>('male');
  const [wives, setWives] = useState('1');
  const [husband, setHusband] = useState('1');
  const [sonsCount, setSonsCount] = useState('1');
  const [daughtersCount, setDaughtersCount] = useState('1');
  const [fatherPresent, setFatherPresent] = useState(true);
  const [motherPresent, setMotherPresent] = useState(true);

  const calculateInheritance = () => {
    const estate = Number(totalEstate) || 0;
    const isMaleDeceased = deceasedGender === 'male';
    const wifeCount = Number(wives) || 0;
    const husbandCount = Number(husband) || 0;
    const hasFather = fatherPresent;
    const hasMother = motherPresent;
    const sCount = Number(sonsCount) || 0;
    const dCount = Number(daughtersCount) || 0;

    const hasChildren = sCount > 0 || dCount > 0;

    // Shares in fraction
    let spouseShare = 0;
    let motherShare = 0;
    let fatherFixedShare = 0;

    // 1. Spouse Share
    if (isMaleDeceased) {
      if (wifeCount > 0) {
        spouseShare = hasChildren ? 0.125 : 0.25; // 1/8 if children, 1/4 if no children
      }
    } else {
      if (husbandCount > 0) {
        spouseShare = hasChildren ? 0.25 : 0.5; // 1/4 if children, 1/2 if no children
      }
    }

    // 2. Mother Share
    if (hasMother) {
      motherShare = hasChildren ? 1/6 : 1/3; // 1/6 if children, 1/3 if no children
    }

    // 3. Father Fixed Share
    if (hasFather) {
      if (hasChildren) {
        fatherFixedShare = 1/6; // 1/6 if children
      }
    }

    // Sum of assigned fixed shares so far
    let totalFixedShares = spouseShare + motherShare + fatherFixedShare;

    // Residue left for children / father
    let residue = 1 - totalFixedShares;
    if (residue < 0) residue = 0;

    const heirs: Array<{ relation: string, percent: number, totalAmount: number, perPerson: number, count: number }> = [];

    // Add Spouse
    if (isMaleDeceased && wifeCount > 0) {
      const totalWifeAmount = estate * spouseShare;
      heirs.push({
        relation: `স্ত্রী (${wifeCount} জন)`,
        percent: spouseShare * 100,
        totalAmount: totalWifeAmount,
        perPerson: totalWifeAmount / wifeCount,
        count: wifeCount
      });
    } else if (!isMaleDeceased && husbandCount > 0) {
      const totalHusbandAmount = estate * spouseShare;
      heirs.push({
        relation: 'স্বামী',
        percent: spouseShare * 100,
        totalAmount: totalHusbandAmount,
        perPerson: totalHusbandAmount,
        count: 1
      });
    }

    // Add Mother
    if (hasMother) {
      const totalMotherAmount = estate * motherShare;
      heirs.push({
        relation: 'মাতা',
        percent: motherShare * 100,
        totalAmount: totalMotherAmount,
        perPerson: totalMotherAmount,
        count: 1
      });
    }

    // Children Shares & Father Residuary
    let fatherResiduaryShare = 0;
    let sonsShareTotal = 0;
    let daughtersShareTotal = 0;

    if (hasChildren) {
      if (sCount > 0) {
        // Sons and Daughters divide the residue in 2:1 ratio
        const totalParts = (sCount * 2) + dCount;
        const sonPartShare = (residue * 2) / totalParts;
        const daughterPartShare = (residue * 1) / totalParts;

        sonsShareTotal = sonPartShare * sCount;
        daughtersShareTotal = daughterPartShare * dCount;

        if (sCount > 0) {
          const totalSonsAmount = estate * sonsShareTotal;
          heirs.push({
            relation: `পুত্র (${sCount} জন)`,
            percent: sonsShareTotal * 100,
            totalAmount: totalSonsAmount,
            perPerson: totalSonsAmount / sCount,
            count: sCount
          });
        }
        if (dCount > 0) {
          const totalDaughtersAmount = estate * daughtersShareTotal;
          heirs.push({
            relation: `কন্যা (${dCount} জন)`,
            percent: daughtersShareTotal * 100,
            totalAmount: totalDaughtersAmount,
            perPerson: totalDaughtersAmount / dCount,
            count: dCount
          });
        }
      } else {
        // Only daughters, no sons
        // Fixed share of daughters:
        // 1 daughter gets 1/2 (50%)
        // 2+ daughters get 2/3 (66.67% shared equally)
        const daughtersFixedShare = dCount === 1 ? 0.5 : 2/3;
        daughtersShareTotal = daughtersFixedShare;

        const totalDaughtersAmount = estate * daughtersShareTotal;
        heirs.push({
          relation: `কন্যা (${dCount} জন)`,
          percent: daughtersShareTotal * 100,
          totalAmount: totalDaughtersAmount,
          perPerson: totalDaughtersAmount / dCount,
          count: dCount
        });

        // The remaining residue goes to the father if present
        const remainingAfterDaughters = residue - daughtersFixedShare;
        if (hasFather && remainingAfterDaughters > 0) {
          fatherResiduaryShare = remainingAfterDaughters;
        } else if (remainingAfterDaughters > 0) {
          const raddShare = remainingAfterDaughters;
          heirs.push({
            relation: 'রদ্দ (মাতা ও কন্যার মধ্যে অতিরিক্ত বণ্টন)',
            percent: raddShare * 100,
            totalAmount: estate * raddShare,
            perPerson: estate * raddShare,
            count: 1
          });
        }
      }
    } else {
      // No children at all
      // Father gets the entire residue
      if (hasFather) {
        fatherResiduaryShare = residue;
      } else if (residue > 0) {
        heirs.push({
          relation: 'অবশিষ্টাংশ (অন্যান্য আসাবা বা বায়তুল মালে প্রাপ্য)',
          percent: residue * 100,
          totalAmount: estate * residue,
          perPerson: estate * residue,
          count: 1
        });
      }
    }

    // Add Father Total
    if (hasFather) {
      const totalFatherShare = fatherFixedShare + fatherResiduaryShare;
      const totalFatherAmount = estate * totalFatherShare;
      heirs.push({
        relation: 'পিতা' + (fatherResiduaryShare > 0 ? ' (নির্ধারিত + আসাবা)' : ''),
        percent: totalFatherShare * 100,
        totalAmount: totalFatherAmount,
        perPerson: totalFatherAmount,
        count: 1
      });
    }

    return heirs;
  };

  const heirsList = calculateInheritance();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">উত্তরাধিকার (Inheritance) ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">ইসলামী শরীয়াহ মোতাবেক মৃত ব্যক্তির সম্পত্তি বণ্টন হিসাব</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deceased details and heirs count */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-sm font-black text-purple-600 mb-2 flex items-center gap-2">
            👤 মৃত ব্যক্তির তথ্য ও উত্তরাধিকারীগণ
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">মোট সম্পত্তির পরিমাণ বা বাজার মূল্য (৳)</label>
            <input 
              type="number" 
              value={totalEstate || ""} 
              onChange={e => setTotalEstate(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 text-sm focus:ring-purple-500" 
              placeholder="উদা: ১০,০০,০০০" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">মৃত ব্যক্তির লিঙ্গ</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setDeceasedGender('male')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  deceasedGender === 'male' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                পুরুষ (স্ত্রী রেখে গেছেন)
              </button>
              <button 
                onClick={() => setDeceasedGender('female')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  deceasedGender === 'female' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                নারী (স্বামী রেখে গেছেন)
              </button>
            </div>
          </div>

          {deceasedGender === 'male' ? (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">স্ত্রীর সংখ্যা (জন)</label>
              <select value={wives || ""} onChange={e => setWives(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm">
                <option value="0">কোন স্ত্রী নেই</option>
                <option value="1">১ জন</option>
                <option value="2">২ জন</option>
                <option value="3">৩ জন</option>
                <option value="4">৪ জন</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">স্বামী বেঁচে আছেন?</label>
              <select value={husband || ""} onChange={e => setHusband(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm">
                <option value="0">না</option>
                <option value="1">হ্যাঁ</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">পুত্রের সংখ্যা (জন)</label>
              <input type="number" min="0" value={sonsCount || ""} onChange={e => setSonsCount(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">কন্যার সংখ্যা (জন)</label>
              <input type="number" min="0" value={daughtersCount || ""} onChange={e => setDaughtersCount(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" placeholder="0" />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="block text-xs font-bold text-gray-500">পিতা ও মাতা বেঁচে আছেন কি?</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer select-none">
                <input type="checkbox" checked={fatherPresent} onChange={e => setFatherPresent(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                পিতা জীবিত আছেন
              </label>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer select-none">
                <input type="checkbox" checked={motherPresent} onChange={e => setMotherPresent(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                মাতা জীবিত আছেন
              </label>
            </div>
          </div>
        </div>

        {/* Distribution results */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-purple-600 mb-4 flex items-center gap-2">
              📊 সম্পত্তি বণ্টন সারসংক্ষেপ
            </h3>
            
            {Number(totalEstate) > 0 ? (
              <div className="space-y-4">
                <div className="border border-purple-100 bg-purple-50/50 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-bold text-purple-800 block">মোট বণ্টনযোগ্য সম্পত্তি</span>
                  <span className="text-2xl font-black text-purple-700">৳ {Number(totalEstate).toLocaleString('en-IN')}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-bold text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400">
                        <th className="py-2">উত্তরাধিকারী</th>
                        <th className="py-2 text-right">অংশ (%)</th>
                        <th className="py-2 text-right">মোট প্রাপ্য (৳)</th>
                        <th className="py-2 text-right">মাথা পিছু (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {heirsList.map((heir, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 text-slate-800">{heir.relation}</td>
                          <td className="py-2.5 text-right text-slate-700">{heir.percent.toFixed(2)}%</td>
                          <td className="py-2.5 text-right text-purple-700">৳ {Math.round(heir.totalAmount).toLocaleString('en-IN')}</td>
                          <td className="py-2.5 text-right text-slate-600">৳ {Math.round(heir.perPerson).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">হিসাব দেখতে সম্পত্তি ইনপুট দিন</p>
                  <p className="text-xs text-slate-400 mt-1">মৃত ব্যক্তির মোট সম্পত্তির মূল্য লিখুন এবং বণ্টন হিসাব দেখুন</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] text-amber-800 leading-relaxed font-semibold mt-4">
            ℹ️ শরীয়াহ অনুযায়ী: পুত্রের অংশ সর্বদা কন্যার অংশের দ্বিগুণ (২:১) হয়ে থাকে। মৃত ব্যক্তির কোনো ঋণ থাকলে বা উনি কোনো অসিয়ত করে থাকলে সম্পত্তি বণ্টনের পূর্বে তা পরিশোধ বা সম্পাদন করা বাধ্যতামুলক।
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Qibla Direction Finder (কিবলা দিক নির্দেশক) ----------------
function QiblaCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [selectedCity, setSelectedCity] = useState('dhaka');
  const [coords, setCoords] = useState({ lat: 23.8103, lon: 90.4125 });
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [isLiveCompass, setIsLiveCompass] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const districts: Record<string, { name: string, lat: number, lon: number }> = {
    dhaka: { name: 'ঢাকা', lat: 23.8103, lon: 90.4125 },
    chittagong: { name: 'চট্টগ্রাম', lat: 22.3569, lon: 91.7832 },
    sylhet: { name: 'সিলেট', lat: 24.8949, lon: 91.8687 },
    khulna: { name: 'খুলনা', lat: 22.8456, lon: 89.5403 },
    rajshahi: { name: 'রাজশাহী', lat: 24.3636, lon: 88.6241 },
    barisal: { name: 'বরিশাল', lat: 22.7010, lon: 90.3535 },
    rangpur: { name: 'রংপুর', lat: 25.7558, lon: 89.2444 },
    mymensingh: { name: 'ময়মনসিংহ', lat: 24.7471, lon: 90.4203 }
  };

  const getQiblaBearing = (lat: number, lon: number) => {
    const kaabaLat = 21.4225 * Math.PI / 180;
    const kaabaLon = 39.8262 * Math.PI / 180;
    const userLat = lat * Math.PI / 180;
    const userLon = lon * Math.PI / 180;

    const dLon = kaabaLon - userLon;

    const y = Math.sin(dLon);
    const x = Math.cos(userLat) * Math.sin(kaabaLat) - Math.sin(userLat) * Math.cos(kaabaLat) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x);
    bearing = bearing * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    if (cityId !== 'gps' && districts[cityId]) {
      setCoords({ lat: districts[cityId].lat, lon: districts[cityId].lon });
      setGpsError(null);
    }
  };

  const requestGpsLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedCity('gps');
          setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
          setGpsError(null);
        },
        (error) => {
          setGpsError('জিপিএস অবস্থান সনাক্ত করতে ব্যর্থ হয়েছে। অনুগ্রহ করে ব্রাউজার পারমিশন পরীক্ষা করুন।');
        }
      );
    } else {
      setGpsError('আপনার ব্রাউজারে জিপিএস অবস্থান সনাক্তকরণের সুবিধা নেই।');
    }
  };

  const startLiveCompass = () => {
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      // @ts-ignore
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // @ts-ignore
        DeviceOrientationEvent.requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation, true);
              setIsLiveCompass(true);
            }
          })
          .catch(() => {
            setGpsError('কম্পাস সেন্সর পারমিশন দেওয়া হয়নি।');
          });
      } else {
        window.addEventListener('deviceorientation', handleOrientation, true);
        setIsLiveCompass(true);
      }
    } else {
      setGpsError('আপনার ডিভাইসে কম্পাস সেন্সর পাওয়া যায়নি।');
    }
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    // @ts-ignore
    let heading = event.webkitCompassHeading || event.alpha;
    if (heading !== null && heading !== undefined) {
      setDeviceHeading(heading);
    }
  };

  React.useEffect(() => {
    return () => {
      if (isLiveCompass) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [isLiveCompass]);

  const qiblaBearing = getQiblaBearing(coords.lat, coords.lon);

  // Bengali numbers helper
  const toBnDigits = (n: number | string) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.toString().split('').map(char => {
      const idx = parseInt(char);
      return isNaN(idx) ? char : bnDigits[idx];
    }).join('');
  };

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">কিবলা দিক নির্দেশক</h2>
          <p className="text-xs text-gray-500">আপনার অবস্থান থেকে পবিত্র কাবা শরীফের নিখুঁত দিক ও কোণ নির্ণয় করুন</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-sm font-black text-yellow-600 flex items-center gap-2">
            📍 অবস্থান নির্বাচন
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">বিভাগ বা জেলা শহর</label>
            <select 
              value={selectedCity || ""} 
              onChange={e => handleCityChange(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-3 text-sm focus:ring-yellow-500"
            >
              {Object.entries(districts).map(([id, item]) => (
                <option key={id} value={id || ""}>{item.name}</option>
              ))}
              <option value="gps">আমার লাইভ অবস্থান (GPS)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={requestGpsLocation} 
              className="flex-1 py-2.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-600 hover:text-white rounded-xl border border-yellow-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <MapPin size={16} />
              আমার লাইভ জিপিএস অবস্থান নিন
            </button>
          </div>

          {gpsError && (
            <p className="text-[11px] text-rose-600 font-bold bg-rose-50 border border-rose-100 rounded-xl p-2.5">
              ⚠️ {gpsError}
            </p>
          )}

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs font-bold text-slate-600">
            <div className="flex justify-between">
              <span>অক্ষাংশ (Latitude):</span>
              <span className="text-slate-800 font-mono">{toBnDigits(coords.lat.toFixed(4))}° N</span>
            </div>
            <div className="flex justify-between">
              <span>দ্রাঘিমাংশ (Longitude):</span>
              <span className="text-slate-800 font-mono">{toBnDigits(coords.lon.toFixed(4))}° E</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-yellow-700 font-black">
              <span>কিবলা কোণ (Qibla Bearing):</span>
              <span className="font-mono">{toBnDigits(Math.round(qiblaBearing))}° (W-S-W)</span>
            </div>
          </div>

          <button 
            onClick={startLiveCompass} 
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Compass size={18} />
            {isLiveCompass ? 'কম্পাস লাইভ চালু আছে' : 'ডিভাইস কম্পাস সক্রিয় করুন (Mobile)'}
          </button>
        </div>

        {/* Visual Compass card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-center mb-4 relative z-10">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">কিবলা সঠিক দিক</span>
            <p className="text-base font-black text-slate-800 mt-1">পবিত্র কাবার অবস্থান (মক্কা)</p>
          </div>

          {/* Compass Graphic */}
          <div className="w-56 h-56 rounded-full bg-slate-50 border-4 border-slate-200 flex items-center justify-center relative shadow-inner">
            {/* Compass Dial Directions */}
            <span className="absolute top-2 text-xs font-black text-rose-600">N (উত্তর)</span>
            <span className="absolute bottom-2 text-xs font-black text-slate-400">S (দক্ষিণ)</span>
            <span className="absolute left-2 text-xs font-black text-slate-400">W (পশ্চিম)</span>
            <span className="absolute right-2 text-xs font-black text-slate-400">E (পূর্ব)</span>

            {/* Qibla Marker Dial */}
            <div 
              className="absolute w-full h-full rounded-full transition-transform duration-300 flex items-center justify-center"
              style={{ transform: `rotate(${- (deviceHeading || 0)}deg)` }}
            >
              {/* Compass Needle pointing to Qibla angle */}
              <div 
                className="w-full h-full relative"
                style={{ transform: `rotate(${qiblaBearing}deg)` }}
              >
                {/* Pointer Arrow */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-500 border-2 border-white rounded-full shadow-md z-20 flex items-center justify-center">
                  <span className="block w-1.5 h-1.5 rounded-full bg-[#01412F]"></span>
                </div>
                {/* Line Pointer */}
                <div className="absolute top-4 bottom-1/2 left-1/2 -translate-x-1/2 w-1 bg-yellow-500 shadow-sm"></div>
                {/* Kaaba Logo Icon at the end of pointer */}
                <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 bg-[#01412F] text-yellow-300 p-1.5 rounded-full shadow-lg border border-yellow-400 z-30">
                  <Compass size={16} className="animate-pulse" />
                </div>
              </div>
            </div>

            {/* Dial background ticks */}
            <div className="w-32 h-32 rounded-full border border-dashed border-slate-200 flex items-center justify-center">
              <span className="text-[10px] font-black text-slate-400">মক্কা ও কিবলা</span>
            </div>
          </div>

          <div className="text-center mt-6 relative z-10 font-bold text-xs text-slate-500 leading-relaxed">
            <p>বাংলাদেশ থেকে কিবলা দিক সাধারণত <span className="text-yellow-600">পশ্চিম থেকে প্রায় ১৫° দক্ষিণে (W-S-W)</span> হয়ে থাকে।</p>
            {deviceHeading !== null && (
              <p className="text-[#009664] mt-1">✓ আপনার ফোন ঘোরান এবং কাবার সাথে সামঞ্জস্য করুন!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Prayer Times Calculator (নামাজের সময়সূচী) ----------------
function PrayerTimesCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [selectedCity, setSelectedCity] = useState('dhaka');
  const [coords, setCoords] = useState({ lat: 23.8103, lon: 90.4125 });
  const [asrMethod, setAsrMethod] = useState<'hanafi' | 'shafi'>('hanafi');
  const [gpsError, setGpsError] = useState<string | null>(null);

  const districts: Record<string, { name: string, lat: number, lon: number }> = {
    dhaka: { name: 'ঢাকা', lat: 23.8103, lon: 90.4125 },
    chittagong: { name: 'চট্টগ্রাম', lat: 22.3569, lon: 91.7832 },
    sylhet: { name: 'সিলেট', lat: 24.8949, lon: 91.8687 },
    khulna: { name: 'খুলনা', lat: 22.8456, lon: 89.5403 },
    rajshahi: { name: 'রাজশাহী', lat: 24.3636, lon: 88.6241 },
    barisal: { name: 'বরিশাল', lat: 22.7010, lon: 90.3535 },
    rangpur: { name: 'রংপুর', lat: 25.7558, lon: 89.2444 },
    mymensingh: { name: 'ময়মনসিংহ', lat: 24.7471, lon: 90.4203 }
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    if (cityId !== 'gps' && districts[cityId]) {
      setCoords({ lat: districts[cityId].lat, lon: districts[cityId].lon });
      setGpsError(null);
    }
  };

  const requestGpsLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedCity('gps');
          setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
          setGpsError(null);
        },
        (error) => {
          setGpsError('জিপিএস অবস্থান সনাক্ত করতে ব্যর্থ হয়েছে। অনুগ্রহ করে ব্রাউজার পারমিশন পরীক্ষা করুন।');
        }
      );
    } else {
      setGpsError('আপনার ব্রাউজারে জিপিএস অবস্থান সনাক্তকরণের সুবিধা নেই।');
    }
  };

  // Compute times
  const today = new Date();
  
  const computePrayerTimes = (latitude: number, longitude: number, timezone: number, date: Date, method: 'hanafi' | 'shafi') => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const N = Math.floor(diff / oneDay);

    const M = 357.5291 + 0.98560028 * N;
    const M_rad = M * Math.PI / 180;

    const L = 280.4665 + 0.98564736 * N;
    const L_rad = L * Math.PI / 180;

    const lambda = L + 1.9146 * Math.sin(M_rad) + 0.0199 * Math.sin(2 * Math.sin(M_rad));
    const lambda_rad = lambda * Math.PI / 180;

    const epsilon = 23.439 - 0.0000004 * N;
    const epsilon_rad = epsilon * Math.PI / 180;

    const delta = Math.asin(Math.sin(epsilon_rad) * Math.sin(lambda_rad));

    const EoT = 9.87 * Math.sin(2 * lambda_rad) - 7.53 * Math.cos(M_rad) - 1.5 * Math.sin(M_rad);

    const dhuhrTime = 12 + timezone - (longitude / 15) - (EoT / 60);

    const getHourAngle = (alpha_deg: number) => {
      const alpha_rad = alpha_deg * Math.PI / 180;
      const phi_rad = latitude * Math.PI / 180;
      const cosH = (Math.sin(alpha_rad) - Math.sin(phi_rad) * Math.sin(delta)) / (Math.cos(phi_rad) * Math.cos(delta));
      if (cosH < -1 || cosH > 1) return null;
      return Math.acos(cosH) * 180 / Math.PI;
    };

    const H_fajr = getHourAngle(-18);
    const fajrTime = H_fajr !== null ? dhuhrTime - (H_fajr / 15) : null;

    const H_sunrise = getHourAngle(-0.833);
    const sunriseTime = H_sunrise !== null ? dhuhrTime - (H_sunrise / 15) : null;

    const H_sunset = getHourAngle(-0.833);
    const maghribTime = H_sunset !== null ? dhuhrTime + (H_sunset / 15) : null;

    const H_isha = getHourAngle(-18);
    const ishaTime = H_isha !== null ? dhuhrTime + (H_isha / 15) : null;

    const phi_rad = latitude * Math.PI / 180;
    const delta_deg = delta * 180 / Math.PI;
    const shadowRatio = method === 'hanafi' ? 2 : 1;
    const diff_deg = Math.abs(latitude - delta_deg);
    const diff_rad = diff_deg * Math.PI / 180;
    
    const cot_alpha_asr = shadowRatio + Math.tan(diff_rad);
    const alpha_asr_rad = Math.atan(1 / cot_alpha_asr);
    const alpha_asr_deg = alpha_asr_rad * 180 / Math.PI;

    const H_asr = getHourAngle(alpha_asr_deg);
    const asrTime = H_asr !== null ? dhuhrTime + (H_asr / 15) : null;

    const formatTime = (timeInHours: number | null) => {
      if (timeInHours === null) return '--:--';
      let hours = Math.floor(timeInHours);
      let minutes = Math.round((timeInHours - hours) * 60);
      if (minutes === 60) {
        hours += 1;
        minutes = 0;
      }
      hours = (hours + 24) % 24;

      const displayHours = hours % 12 === 0 ? 12 : hours % 12;
      const padMin = minutes < 10 ? '0' + minutes : minutes;
      const period = hours >= 12 ? 'পিএম' : 'এএম';

      return `${displayHours}:${padMin} ${period}`;
    };

    return {
      fajr: formatTime(fajrTime),
      sunrise: formatTime(sunriseTime),
      dhuhr: formatTime(dhuhrTime),
      asr: formatTime(asrTime),
      maghrib: formatTime(maghribTime),
      isha: formatTime(ishaTime)
    };
  };

  const times = computePrayerTimes(coords.lat, coords.lon, 6, today, asrMethod);

  // Bengali numbers helper
  const toBnDigits = (n: number | string) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.toString().split('').map(char => {
      const idx = parseInt(char);
      return isNaN(idx) ? char : bnDigits[idx];
    }).join('');
  };

  // Convert English time strings in Bengali for native appearance
  const toBnTime = (timeStr: string) => {
    if (timeStr === '--:--') return timeStr;
    const replaced = timeStr
      .replace('AM', 'ভোর/সকাল')
      .replace('PM', 'দুপুর/বিকাল/রাত')
      .replace('এএম', 'ভোর/সকাল')
      .replace('পিএম', 'দুপুর/বিকাল/রাত');
    return toBnDigits(replaced);
  };

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">নামাজের চিরস্থায়ী সময়সূচী</h2>
          <p className="text-xs text-gray-500">আপনার এলাকার দৈনিক ৫ ওয়াক্ত নামাজের সঠিক ওয়াক্ত ও নিষিদ্ধ সময়</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5 md:col-span-1">
          <h3 className="text-sm font-black text-blue-600 flex items-center gap-2">
            ⚙️ সেটিংস ও অবস্থান
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">বিভাগ বা জেলা শহর</label>
            <select 
              value={selectedCity || ""} 
              onChange={e => handleCityChange(e.target.value)} 
              className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm focus:ring-blue-500"
            >
              {Object.entries(districts).map(([id, item]) => (
                <option key={id} value={id || ""}>{item.name}</option>
              ))}
              <option value="gps">আমার লাইভ অবস্থান (GPS)</option>
            </select>
          </div>

          <button 
            onClick={requestGpsLocation} 
            className="w-full py-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl border border-blue-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <MapPin size={14} />
            জিপিএস দিয়ে অবস্থান সনাক্ত করুন
          </button>

          {gpsError && (
            <p className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 p-2 rounded-xl">
              ⚠️ {gpsError}
            </p>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">আসর ওয়াক্ত হিসাবের নিয়ম</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setAsrMethod('hanafi')}
                className={`p-2 rounded-xl border text-[11px] font-bold transition-all ${
                  asrMethod === 'hanafi' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                হানাফি (Hanafi)
              </button>
              <button 
                onClick={() => setAsrMethod('shafi')}
                className={`p-2 rounded-xl border text-[11px] font-bold transition-all ${
                  asrMethod === 'shafi' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                শাফি/অন্যান্য
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] text-slate-500 leading-relaxed font-semibold">
            <span className="block text-slate-800 font-bold mb-1">📌 গুরুত্বপূর্ণ তথ্য:</span>
            বাংলাদেশ ও আশপাশের অঞ্চলে আসর নামাজের জন্য ডিফল্টভাবে হানাফি হিসাব ব্যবহার করা হয় (যেখানে ছায়া দ্বিগুণ ধরা হয়)।
          </div>
        </div>

        {/* Times display list */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm md:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-800">
              📅 আজকের সময়সূচী ({toBnDigits(today.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }))})
            </h3>
            <span className="text-[10px] font-bold bg-[#009664]/10 text-[#009664] px-2 py-0.5 rounded-full">
              অটো-হিসাবকৃত
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Moon size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">ফজর (Fajr)</p>
                  <p className="text-base font-black text-slate-800">শুরু সময়</p>
                </div>
              </div>
              <span className="text-sm font-black text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-xl">
                {toBnTime(times.fajr)}
              </span>
            </div>

            <div className="border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <Sun size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">সূর্যোদয় (Sunrise)</p>
                  <p className="text-base font-black text-slate-800">ওয়াক্ত শেষ</p>
                </div>
              </div>
              <span className="text-sm font-black text-amber-600 bg-amber-50/50 px-3 py-1 rounded-xl">
                {toBnTime(times.sunrise)}
              </span>
            </div>

            <div className="border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                  <Sun size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">যোহর (Dhuhr)</p>
                  <p className="text-base font-black text-slate-800">দুপুরের ওয়াক্ত</p>
                </div>
              </div>
              <span className="text-sm font-black text-yellow-600 bg-yellow-50/50 px-3 py-1 rounded-xl">
                {toBnTime(times.dhuhr)}
              </span>
            </div>

            <div className="border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                  <Sun size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">আসর (Asr)</p>
                  <p className="text-base font-black text-slate-800">বিকালে ওয়াক্ত</p>
                </div>
              </div>
              <span className="text-sm font-black text-orange-600 bg-orange-50/50 px-3 py-1 rounded-xl">
                {toBnTime(times.asr)}
              </span>
            </div>

            <div className="border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                  <Moon size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">মাগরিব (Maghrib)</p>
                  <p className="text-base font-black text-slate-800">সন্ধ্যা/ইফতার সময়</p>
                </div>
              </div>
              <span className="text-sm font-black text-rose-600 bg-rose-50/50 px-3 py-1 rounded-xl">
                {toBnTime(times.maghrib)}
              </span>
            </div>

            <div className="border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Moon size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">এশা (Isha)</p>
                  <p className="text-base font-black text-slate-800">রাতের ওয়াক্ত</p>
                </div>
              </div>
              <span className="text-sm font-black text-purple-600 bg-purple-50/50 px-3 py-1 rounded-xl">
                {toBnTime(times.isha)}
              </span>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3.5 text-[11px] text-amber-800 leading-relaxed font-semibold">
            🚨 নামাজের নিষিদ্ধ সময়: সূর্যোদয়ের সময় (Fajr ওয়াক্ত শেষের পর ১৫ মিনিট), সূর্য ঠিক মধ্যগগনে থাকার সময় (Dhuhr শুরুর ঠিক পূর্বের ৭-১০ মিনিট), এবং সূর্যাস্তের সময় (Maghrib ওয়াক্তের ঠিক আগের ১০-১৫ মিনিট) যেকোনো নামাজ আদায় করা কঠোরভাবে নিষিদ্ধ।
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
//             HEALTH CALCULATORS
// ==========================================

// Bengali digits helper
function toBn(n: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return n.toString().replace(/\d/g, d => bnDigits[parseInt(d)]);
}

// ---------------- BMI Calculator (বিএমআই ক্যালকুলেটর) ----------------
function BMICalculator({ onGoBack }: { onGoBack: () => void }) {
  const [weight, setWeight] = useState('65');
  const [heightUnit, setHeightUnit] = useState<'ft' | 'cm'>('ft');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('6');
  const [heightCm, setHeightCm] = useState('168');

  const calculateBMI = () => {
    const w = parseFloat(weight) || 0;
    let hMeters = 0;

    if (heightUnit === 'ft') {
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      hMeters = (ft * 0.3048) + (inch * 0.0254);
    } else {
      const cm = parseFloat(heightCm) || 0;
      hMeters = cm / 100;
    }

    if (hMeters <= 0 || w <= 0) return null;

    const bmi = w / (hMeters * hMeters);
    
    let status = '';
    let colorClass = '';
    let barPercent = 0;
    let advice = '';

    if (bmi < 18.5) {
      status = 'কম ওজন (Underweight)';
      colorClass = 'text-blue-500';
      barPercent = Math.max(5, ((bmi - 15) / 3.5) * 20);
      advice = 'আপনার ওজন স্বাভাবিকের চেয়ে কম। পুষ্টিকর ও সুষম খাবার খেয়ে ওজন বাড়ানোর চেষ্টা করুন। প্রয়োজনে পুষ্টিবিদের পরামর্শ নিন।';
    } else if (bmi >= 18.5 && bmi < 25) {
      status = 'স্বাভাবিক ওজন (Normal)';
      colorClass = 'text-[#009664] font-bold';
      barPercent = 20 + ((bmi - 18.5) / 6.5) * 30;
      advice = 'অভিনন্দন! আপনার ওজন একদম আদর্শ সীমায় রয়েছে। স্বাস্থ্যকর জীবনযাত্রা ও সুষম খাদ্য তালিকা বজায় রাখুন।';
    } else if (bmi >= 25 && bmi < 30) {
      status = 'অতিরিক্ত ওজন (Overweight)';
      colorClass = 'text-amber-500';
      barPercent = 50 + ((bmi - 25) / 5) * 25;
      advice = 'আপনার ওজন স্বাভাবিকের চেয়ে বেশি। নিয়মিত হাঁটাচলা, শারীরিক পরিশ্রম ও খাদ্যাভ্যাস নিয়ন্ত্রণের মাধ্যমে ওজন হ্রাস করার চেষ্টা করুন।';
    } else {
      status = 'স্থূলতা বা অতি-ওজন (Obese)';
      colorClass = 'text-red-500 font-black';
      barPercent = Math.min(95, 75 + ((bmi - 30) / 10) * 20);
      advice = 'আপনার অতিরিক্ত ওজন স্বাস্থ্যঝুঁকি বাড়াতে পারে। অবিলম্বে চর্বিযুক্ত ও মিষ্টি জাতীয় খাবার এড়িয়ে চলুন, দৈনিক ব্যায়াম করুন এবং চিকিৎসকের পরামর্শ নিন।';
    }

    return {
      bmi: bmi.toFixed(1),
      status,
      colorClass,
      barPercent,
      advice
    };
  };

  const result = calculateBMI();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">বিএমআই (BMI) ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">আপনার বডি মাস ইনডেক্স এবং আদর্শ স্বাস্থ্য পরিমাপ হিসাব করুন</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-sm font-black text-red-500">⚖️ আপনার তথ্য লিখুন</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">উচ্চতা পরিমাপের একক</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setHeightUnit('ft')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    heightUnit === 'ft' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  ফুট ও ইঞ্চি (Feet/Inches)
                </button>
                <button 
                  onClick={() => setHeightUnit('cm')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    heightUnit === 'cm' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  সেমি (Centimeters)
                </button>
              </div>
            </div>

            {heightUnit === 'ft' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">ফুট (Ft)</label>
                  <input 
                    type="number" 
                    value={heightFt || ""} 
                    onChange={e => setHeightFt(e.target.value)} 
                    className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" 
                    min="1" 
                    max="10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">ইঞ্চি (In)</label>
                  <input 
                    type="number" 
                    value={heightIn || ""} 
                    onChange={e => setHeightIn(e.target.value)} 
                    className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" 
                    min="0" 
                    max="11"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">উচ্চতা (সেমি)</label>
                <input 
                  type="number" 
                  value={heightCm || ""} 
                  onChange={e => setHeightCm(e.target.value)} 
                  className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" 
                  min="50" 
                  max="300"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ওজন (কেজি - kg)</label>
              <input 
                type="number" 
                value={weight || ""} 
                onChange={e => setWeight(e.target.value)} 
                className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" 
                min="5" 
                max="500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-red-500 mb-4">📊 বিএমআই রিপোর্ট</h3>

            {result ? (
              <div className="space-y-6">
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5 text-center">
                  <span className="text-[10px] font-bold text-red-800 block">আপনার বিএমআই স্কোর</span>
                  <span className="text-4xl font-black text-red-500">{toBn(result.bmi)}</span>
                  <p className={`text-sm mt-1 font-bold ${result.colorClass}`}>{result.status}</p>
                </div>

                {/* Meter Bar */}
                <div className="space-y-1">
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative flex">
                    <div className="h-full w-[18.5%] bg-blue-300"></div>
                    <div className="h-full w-[6.5%] bg-emerald-400"></div>
                    <div className="h-full w-[5%] bg-amber-300"></div>
                    <div className="h-full w-[70%] bg-red-400"></div>
                    
                    {/* Active pin */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-black border border-white transition-all duration-500"
                      style={{ left: `${result.barPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1">
                    <span>কম (&lt;১৮.৫)</span>
                    <span>স্বাভাবিক (১৮.৫ - ২৫)</span>
                    <span>বেশি (২৫ - ৩০)</span>
                    <span>স্থূলতা (&gt;৩০)</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 leading-relaxed font-semibold">
                  <span className="block font-bold text-slate-800 mb-1">💡 health পরামর্শ:</span>
                  {result.advice}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Scale size={32} className="mb-2" />
                <p className="text-xs">আপনার সঠিক তথ্যগুলো পূরণ করলে এখানে বিএমআই রিপোর্ট প্রদর্শিত হবে।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Ideal Weight Calculator (আদর্শ ওজন ক্যালকুলেটর) ----------------
function IdealWeightCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [heightUnit, setHeightUnit] = useState<'ft' | 'cm'>('ft');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('6');
  const [heightCm, setHeightCm] = useState('168');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [currentWeight, setCurrentWeight] = useState('65');

  const calculateIdealWeight = () => {
    let inchesOver5Ft = 0;
    let hMeters = 0;

    if (heightUnit === 'ft') {
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      const totalInches = (ft * 12) + inch;
      inchesOver5Ft = totalInches - 60;
      hMeters = (ft * 0.3048) + (inch * 0.0254);
    } else {
      const cm = parseFloat(heightCm) || 0;
      hMeters = cm / 100;
      const totalInches = cm / 2.54;
      inchesOver5Ft = totalInches - 60;
    }

    if (hMeters <= 0) return null;

    // Devine formula
    let devineWeight = 0;
    if (gender === 'male') {
      devineWeight = 50.0 + (2.3 * inchesOver5Ft);
    } else {
      devineWeight = 45.5 + (2.3 * inchesOver5Ft);
    }
    if (devineWeight < 30) devineWeight = 45.0; 

    // BMI healthy range
    const minWeight = 18.5 * hMeters * hMeters;
    const maxWeight = 24.9 * hMeters * hMeters;

    const curW = parseFloat(currentWeight) || 0;
    let weightDiffStr = '';
    let diffColorClass = 'text-slate-600';

    if (curW > 0) {
      if (curW < minWeight) {
        const toGain = minWeight - curW;
        weightDiffStr = `আদর্শ ওজনে পৌঁছাতে আপনার আরও প্রায় ${toGain.toFixed(1)} কেজি ওজন বাড়ানো প্রয়োজন।`;
        diffColorClass = 'text-blue-600';
      } else if (curW > maxWeight) {
        const toLose = curW - maxWeight;
        weightDiffStr = `আদর্শ ওজনে পৌঁছাতে আপনার আরও প্রায় ${toLose.toFixed(1)} কেজি ওজন কমানো প্রয়োজন।`;
        diffColorClass = 'text-red-500';
      } else {
        weightDiffStr = 'অভিনন্দন! আপনার বর্তমান ওজন একদম আদর্শ সীমায় রয়েছে।';
        diffColorClass = 'text-emerald-600';
      }
    }

    return {
      devine: Math.round(devineWeight),
      minW: minWeight.toFixed(1),
      maxW: maxWeight.toFixed(1),
      diffMessage: weightDiffStr,
      diffColorClass
    };
  };

  const results = calculateIdealWeight();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">আদর্শ ওজন (Ideal Weight) ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">লিঙ্গ ও উচ্চতা অনুযায়ী আপনার সঠিক আদর্শ ওজনের সীমা জানুন</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-sm font-black text-emerald-600">👤 আপনার শারীরিক বিবরণ</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">লিঙ্গ নির্বাচন করুন</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setGender('male')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    gender === 'male' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  পুরুষ (Male)
                </button>
                <button 
                  onClick={() => setGender('female')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    gender === 'female' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  নারী (Female)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">উচ্চতা পরিমাপের একক</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setHeightUnit('ft')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    heightUnit === 'ft' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  ফুট ও ইঞ্চি
                </button>
                <button 
                  onClick={() => setHeightUnit('cm')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    heightUnit === 'cm' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  সেমি (cm)
                </button>
              </div>
            </div>

            {heightUnit === 'ft' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">ফুট</label>
                  <input type="number" value={heightFt || ""} onChange={e => setHeightFt(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">ইঞ্চি</label>
                  <input type="number" value={heightIn || ""} onChange={e => setHeightIn(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">উচ্চতা (সেমি)</label>
                <input type="number" value={heightCm || ""} onChange={e => setHeightCm(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">বর্তমান ওজন (কেজি - ঐচ্ছিক)</label>
              <input 
                type="number" 
                value={currentWeight || ""} 
                onChange={e => setCurrentWeight(e.target.value)} 
                className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" 
                placeholder="উদা: ৬৫"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-emerald-600 mb-4">📊 আদর্শ ওজন রিপোর্ট</h3>

            {results ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-emerald-100 bg-emerald-50/50 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-emerald-800 block">আদর্শ ওজন (Devine Formula)</span>
                    <span className="text-3xl font-black text-emerald-600">{toBn(results.devine)} কেজি</span>
                  </div>
                  <div className="border border-indigo-100 bg-indigo-50/50 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-indigo-800 block">স্বাস্থ্যসম্মত ওজনের সীমা (BMI)</span>
                    <span className="text-xl font-black text-indigo-700">{toBn(results.minW)} - {toBn(results.maxW)} কেজি</span>
                  </div>
                </div>

                {currentWeight && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                    <p className={`text-sm font-bold ${results.diffColorClass}`}>{toBn(results.diffMessage)}</p>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed font-semibold">
                  💡 দ্রষ্টব্য: এই আদর্শ ওজন পরিমাপটি আপনার শারীরিক গঠনের ওপর নির্ভর করে পরিবর্তিত হতে পারে। অ্যাথলেট বা গর্ভবতী মায়েদের ক্ষেত্রে এই হিসাবটি ভিন্ন হতে পারে।
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Activity size={32} className="mb-2" />
                <p className="text-xs">সঠিক উচ্চতা ইনপুট দিলে এখানে আদর্শ ওজন ও পরামর্শ দেখতে পাবেন।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Water Intake Calculator (পানি পানের পরিমাণ ক্যালকুলেটর) ----------------
function WaterIntakeCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [weight, setWeight] = useState('60');
  const [activity, setActivity] = useState<'low' | 'med' | 'high'>('med');
  const [climate, setClimate] = useState<'cold' | 'normal' | 'hot'>('normal');
  const [drankGlasses, setDrankGlasses] = useState(0);

  const calculateWaterIntake = () => {
    const w = parseFloat(weight) || 0;
    if (w <= 0) return null;

    let intakeMl = w * 35;

    if (activity === 'med') intakeMl += 500;
    else if (activity === 'high') intakeMl += 1000;

    if (climate === 'cold') intakeMl -= 250;
    else if (climate === 'hot') intakeMl += 500;

    const liters = intakeMl / 1000;
    const glasses = Math.ceil(intakeMl / 250);

    return {
      liters: liters.toFixed(1),
      glasses
    };
  };

  const results = calculateWaterIntake();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">পানি পানের পরিমাণ ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">আপনার ওজন, দৈনন্দিন পরিশ্রম ও আবহাওয়া অনুযায়ী পানির প্রয়োজনীয়তা নির্ধারণ করুন</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-sm font-black text-blue-600">💧 পানির পরিমাণ হিসাবের তথ্য</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ওজন (কেজি - kg)</label>
              <input 
                type="number" 
                value={weight || ""} 
                onChange={e => setWeight(e.target.value)} 
                className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" 
                min="1"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">শারীরিক পরিশ্রমের মাত্রা</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setActivity('low')}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition-all ${
                    activity === 'low' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  কম পরিশ্রমী
                </button>
                <button 
                  onClick={() => setActivity('med')}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition-all ${
                    activity === 'med' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  মাঝারি পরিশ্রমী
                </button>
                <button 
                  onClick={() => setActivity('high')}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition-all ${
                    activity === 'high' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  অত্যন্ত পরিশ্রমী
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">বর্তমান আবহাওয়া</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setClimate('cold')}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition-all ${
                    climate === 'cold' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  ঠাণ্ডা (শীতকাল)
                </button>
                <button 
                  onClick={() => setClimate('normal')}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition-all ${
                    climate === 'normal' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  স্বাভাবিক
                </button>
                <button 
                  onClick={() => setClimate('hot')}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition-all ${
                    climate === 'hot' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  গরম বা আর্দ্র
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-blue-600 mb-4">📊 দৈনিক পানির প্রয়োজনীয়তা</h3>

            {results ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-blue-100 bg-blue-50/50 rounded-2xl p-4 text-center flex flex-col justify-center items-center">
                    <Droplet className="w-7 h-7 text-blue-500 mb-1 animate-bounce" />
                    <span className="text-[10px] font-bold text-blue-800 block">মোট পানির পরিমাণ</span>
                    <span className="text-2xl font-black text-blue-600">{toBn(results.liters)} লিটার</span>
                  </div>
                  <div className="border border-indigo-100 bg-indigo-50/50 rounded-2xl p-4 text-center flex flex-col justify-center items-center">
                    <span className="text-3xl font-black text-indigo-700">{toBn(results.glasses)} গ্লাস</span>
                    <span className="text-[10px] font-bold text-indigo-800 mt-1 block">(প্রতি গ্লাস ২৫০ মিলি)</span>
                  </div>
                </div>

                {/* Interactive glasses tracker */}
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-center space-y-3">
                  <span className="text-xs font-black text-slate-700 block">🥛 আজ কত গ্লাস পানি পান করেছেন? (লাইভ ট্র্যাকার)</span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Array.from({ length: results.glasses }).map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setDrankGlasses(prev => prev === idx + 1 ? idx : idx + 1)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          idx < drankGlasses ? 'bg-blue-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-blue-300'
                        }`}
                      >
                        <Droplet size={18} />
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 font-sans">
                    {drankGlasses >= results.glasses ? (
                      <span className="text-[#009664]">🎉 অভিনন্দন! আপনার আজকের পানি পানের দৈনিক লক্ষ্যমাত্রা অর্জিত হয়েছে!</span>
                    ) : (
                      `আজ আপনি ${toBn(drankGlasses)} গ্লাস পানি পান করেছেন। লক্ষ্য পূরণ করতে আরও ${toBn(results.glasses - drankGlasses)} গ্লাস বাকি।`
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Droplet size={32} className="mb-2" />
                <p className="text-xs"> hisab দেখতে ওজন ও অন্যান্য বিবরণ দিন।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Pregnancy Due Date Calculator (গর্ভধারণ প্রসবের সম্ভাব্য তারিখ) ----------------
function PregnancyDueDateCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [lmp, setLmp] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [cycleDays, setCycleDays] = useState('28');

  const calculatePregnancy = () => {
    if (!lmp) return null;
    const lmpDate = new Date(lmp);
    if (isNaN(lmpDate.getTime())) return null;

    const cycle = parseInt(cycleDays) || 28;
    const diffFromDefaultCycle = cycle - 28;

    const edd = new Date(lmpDate);
    edd.setDate(edd.getDate() + 280 + diffFromDefaultCycle);

    const today = new Date();
    const diffMs = today.getTime() - lmpDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        invalid: true,
        message: 'মাসিকের তারিখটি আজকের চেয়ে আগের হতে হবে।'
      };
    }

    const weeks = Math.floor(diffDays / 7);
    const remDays = diffDays % 7;

    const remainingDays = Math.floor((edd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let trimesterBn = '';
    let trimesterAdvice = '';

    if (weeks < 13) {
      trimesterBn = 'প্রথম ট্রাইমেস্টার (১ম - ১২তম সপ্তাহ)';
      trimesterAdvice = 'এই সময়ে পর্যাপ্ত ফলিক অ্যাসিড গ্রহণ করুন, ক্লান্তি এড়াতে পর্যাপ্ত বিশ্রাম নিন এবং ভারী কাজ পরিহার করুন।';
    } else if (weeks >= 13 && weeks < 27) {
      trimesterBn = 'দ্বিতীয় ট্রাইমেস্টার (১৩তম - ২৬তম সপ্তাহ)';
      trimesterAdvice = 'আপনার শিশুর অঙ্গ-প্রত্যঙ্গ দ্রুত গঠিত হচ্ছে। আয়রন ও ক্যালসিয়াম সমৃদ্ধ খাবার বাড়ান এবং নিয়মিত হালকা হাঁটাহাঁটি করুন।';
    } else {
      trimesterBn = 'তৃতীয় ট্রাইমেস্টার (২৭তম - ৪০তম সপ্তাহ)';
      trimesterAdvice = 'প্রসবের সময় ঘনিয়ে আসছে। নিয়মিত চেকআপ করান, প্রসবের জরুরি ব্যাগ ও হাসপাতালের সিদ্ধান্ত চূড়ান্ত করে রাখুন।';
    }

    return {
      invalid: false,
      edd: edd.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      weeks,
      remDays,
      remainingDays,
      trimesterBn,
      trimesterAdvice,
      progressPercent: Math.min(100, Math.max(0, Math.round((diffDays / 280) * 100)))
    };
  };

  const results = calculatePregnancy();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">গর্ভধারণ প্রসবের সম্ভাব্য তারিখ</h2>
          <p className="text-xs text-gray-500">শেষ মাসিকের প্রথম দিন ও চক্রের দৈর্ঘ্য অনুযায়ী প্রসবের সম্ভাব্য তারিখ ও অগ্রগতি জানুন</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-sm font-black text-purple-600">📅 মাসিকের বিবরণ দিন</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">শেষ মাসিকের প্রথম দিন (LMP Date)</label>
              <input 
                type="date" 
                value={lmp || ""} 
                onChange={e => setLmp(e.target.value)} 
                className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">গড় মাসিক চক্রের সময় (দিন)</label>
              <input 
                type="number" 
                value={cycleDays || ""} 
                onChange={e => setCycleDays(e.target.value)} 
                className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" 
                placeholder="28" 
                min="20" 
                max="45"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-purple-600 mb-4">👶 গর্ভকালীন বিবরণ ও ফলাফল</h3>

            {results && !results.invalid ? (
              <div className="space-y-6">
                <div className="border border-purple-100 bg-purple-50/50 rounded-2xl p-5 text-center space-y-1">
                  <span className="text-[10px] font-bold text-purple-800 block">সম্ভাব্য প্রসবের তারিখ (Estimated Due Date)</span>
                  <span className="text-2xl font-black text-purple-700">{results.edd}</span>
                  <p className="text-xs font-bold text-slate-500">
                    (প্রসবের বাকি আর প্রায় <span className="text-purple-600 font-extrabold">{toBn(results.remainingDays)} দিন</span>)
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600">গর্ভধারণের অগ্রগতি</span>
                      <span className="text-purple-700">{toBn(results.progressPercent)}% সম্পন্ন</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-500" 
                        style={{ width: `${results.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                    <span className="text-xs font-bold text-slate-500">বর্তমান গর্ভকাল (Gestational Age):</span>
                    <span className="text-sm font-extrabold text-purple-700">
                      {toBn(results.weeks)} সপ্তাহ {toBn(results.remDays)} দিন
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-indigo-50/40 border border-indigo-100 p-3.5 rounded-xl">
                    <span className="text-xs font-bold text-indigo-800">বর্তমান ট্রাইমেস্টার:</span>
                    <span className="text-xs font-black text-indigo-700">{results.trimesterBn}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed font-semibold">
                  <span className="block font-bold text-slate-800 mb-1">💡 এই ত্রৈমাসিকের বিশেষ পরামর্শ:</span>
                  {results.trimesterAdvice}
                </div>
              </div>
            ) : results?.invalid ? (
              <p className="text-xs text-rose-500 font-bold bg-rose-50 border border-rose-100 p-3 rounded-xl">{results.message}</p>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Calendar size={32} className="mb-2" />
                <p className="text-xs">তারিখ সিলেক্ট করলে এখানে গর্ভধারণের বিশদ রিপোর্ট দেখতে পাবেন।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Calorie Calculator (ক্যালরি ক্যালকুলেটর) ----------------
function CalorieCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState('65');
  const [heightUnit, setHeightUnit] = useState<'ft' | 'cm'>('ft');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('6');
  const [heightCm, setHeightCm] = useState('168');
  const [age, setAge] = useState('28');
  const [activity, setActivity] = useState('1.375');
  const [goal, setGoal] = useState<'maintain' | 'lose' | 'gain'>('maintain');

  const calculateCalories = () => {
    const w = parseFloat(weight) || 0;
    const a = parseFloat(age) || 0;
    const actFactor = parseFloat(activity) || 1.2;
    let hCm = 0;

    if (heightUnit === 'ft') {
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      hCm = ((ft * 12) + inch) * 2.54;
    } else {
      hCm = parseFloat(heightCm) || 0;
    }

    if (w <= 0 || hCm <= 0 || a <= 0) return null;

    let bmr = 0;
    if (gender === 'male') {
      bmr = (10 * w) + (6.25 * hCm) - (5 * a) + 5;
    } else {
      bmr = (10 * w) + (6.25 * hCm) - (5 * a) - 161;
    }

    const tdee = bmr * actFactor;

    let targetCal = tdee;
    if (goal === 'lose') {
      targetCal = tdee - 500;
    } else if (goal === 'gain') {
      targetCal = tdee + 500;
    }

    const minSafe = gender === 'male' ? 1500 : 1200;
    if (targetCal < minSafe) targetCal = minSafe;

    const carbsG = (targetCal * 0.50) / 4;
    const proteinG = (targetCal * 0.25) / 4;
    const fatG = (targetCal * 0.25) / 9;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      target: Math.round(targetCal),
      carbs: Math.round(carbsG),
      protein: Math.round(proteinG),
      fat: Math.round(fatG)
    };
  };

  const results = calculateCalories();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 hover:bg-orange-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">ক্যালরি ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">আপনার বয়স, ওজন ও শারীরিক পরিশ্রম অনুযায়ী দৈনিক ক্যালরি ও ম্যাক্রো পুষ্টি হিসাব করুন</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-orange-600">⚙️ সেটিংস ও বিবরণ</h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setGender('male')} className={`p-2 rounded-xl border font-bold transition-all ${gender === 'male' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>পুরুষ (Male)</button>
              <button onClick={() => setGender('female')} className={`p-2 rounded-xl border font-bold transition-all ${gender === 'female' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>নারী (Female)</button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-gray-500 mb-1">বয়স (বছর)</label>
                <input type="number" value={age || ""} onChange={e => setAge(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2 text-sm" />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">ওজন (কেজি)</label>
                <input type="number" value={weight || ""} onChange={e => setWeight(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setHeightUnit('ft')} className={`p-2 rounded-xl border font-bold transition-all ${heightUnit === 'ft' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>ফুট ও ইঞ্চি</button>
              <button onClick={() => setHeightUnit('cm')} className={`p-2 rounded-xl border font-bold transition-all ${heightUnit === 'cm' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>সেমি (cm)</button>
            </div>

            {heightUnit === 'ft' ? (
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="ফুট" value={heightFt || ""} onChange={e => setHeightFt(e.target.value)} className="border-gray-200 rounded-xl bg-gray-50 p-2 text-sm" />
                <input type="number" placeholder="ইঞ্চি" value={heightIn || ""} onChange={e => setHeightIn(e.target.value)} className="border-gray-200 rounded-xl bg-gray-50 p-2 text-sm" />
              </div>
            ) : (
              <input type="number" value={heightCm || ""} onChange={e => setHeightCm(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2 text-sm" />
            )}

            <div>
              <label className="block font-bold text-gray-500 mb-1">শারীরিক সক্রিয়তার হার</label>
              <select value={activity || ""} onChange={e => setActivity(e.target.value)} className="w-full border-gray-200 rounded-xl bg-gray-50 p-2 text-xs">
                <option value="1.2">অলস (শারীরিক কসরত নেই বললেই চলে)</option>
                <option value="1.375">হালকা সক্রিয় (সপ্তাহে ১-৩ দিন ব্যায়াম)</option>
                <option value="1.55">মাঝারি সক্রিয় (সপ্তাহে ৩-৫ দিন মাঝারি ব্যায়াম)</option>
                <option value="1.725">অত্যন্ত সক্রিয় (সপ্তাহে ৬-৭ দিন ভারী ব্যায়াম)</option>
                <option value="1.9">কঠোর পরিশ্রমী (অ্যাথলেট বা দৈহিক শ্রমের পেশা)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">আপনার ফিটনেস লক্ষ্য</label>
              <div className="grid grid-cols-3 gap-1">
                <button onClick={() => setGoal('lose')} className={`p-2 rounded-xl border font-bold text-[11px] transition-all ${goal === 'lose' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>ওজন হ্রাস (-৫০০ ক্যালরি)</button>
                <button onClick={() => setGoal('maintain')} className={`p-2 rounded-xl border font-bold text-[11px] transition-all ${goal === 'maintain' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>ওজন ঠিক রাখা</button>
                <button onClick={() => setGoal('gain')} className={`p-2 rounded-xl border font-bold text-[11px] transition-all ${goal === 'gain' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>ওজন বৃদ্ধি (+৫০০ ক্যালরি)</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-orange-600 mb-4">📊 ক্যালরি লক্ষ্যমাত্রা ও পুষ্টি বণ্টন</h3>

            {results ? (
              <div className="space-y-5">
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-bold text-orange-800 block">দৈনিক প্রয়োজনীয় লক্ষ্যমাত্রা ক্যালরি</span>
                  <span className="text-3xl font-black text-orange-600">{toBn(results.target)} কিলোক্যালরি (kcal)</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-bold">
                    (আপনার বজায় রাখার ক্যালরি হচ্ছে {toBn(results.tdee)} kcal)
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-700 block">🥩 আপনার দৈনিক ম্যাক্রো পুষ্টির বণ্টন:</span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-amber-100 bg-amber-50/20 p-3 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-amber-800 block">শর্করা (Carbs)</span>
                      <span className="text-sm font-black text-amber-700">{toBn(results.carbs)} গ্রাম</span>
                      <span className="text-[9px] block text-slate-400">৫০% শক্তি</span>
                    </div>
                    <div className="border border-emerald-100 bg-emerald-50/20 p-3 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-emerald-800 block">আমিষ (Protein)</span>
                      <span className="text-sm font-black text-emerald-700">{toBn(results.protein)} গ্রাম</span>
                      <span className="text-[9px] block text-slate-400">২৫% শক্তি</span>
                    </div>
                    <div className="border border-rose-100 bg-rose-50/20 p-3 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-rose-800 block">স্নেহ (Fat)</span>
                      <span className="text-sm font-black text-rose-700">{toBn(results.fat)} গ্রাম</span>
                      <span className="text-[9px] block text-slate-400">২৫% শক্তি</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed font-semibold">
                  💡 পরামর্শ: ওজন হ্রাস বা বৃদ্ধির জন্য পুষ্টিকর প্রোটিন, শাকসবজি ও পর্যাপ্ত তরল খাদ্য বেছে নিন। নিয়মিত শারীরিক পরিশ্রম ফলাফলকে ত্বরান্বিত করবে।
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Flame size={32} className="mb-2 animate-pulse" />
                <p className="text-xs">আপনার সঠিক বয়স, উচ্চতা ও ওজন ইনপুট দিলে এখানে দৈনিক ক্যালরি ও ম্যাক্রো পুষ্টির চার্ট দেখতে পাবেন।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Heart Rate Calculator (হৃদস্পন্দন ক্যালকুলেটর) ----------------
function HeartRateCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [age, setAge] = useState('25');
  const [restingHr, setRestingHr] = useState('70');

  const calculateHeartRate = () => {
    const a = parseInt(age) || 0;
    const rhr = parseInt(restingHr) || 70;

    if (a <= 0 || a > 120) return null;

    const mhr = 220 - a;
    const hrr = mhr - rhr;

    const getZoneRange = (minPercent: number, maxPercent: number) => {
      const minBpm = rhr + (minPercent * hrr);
      const maxBpm = rhr + (maxPercent * hrr);
      return `${Math.round(minBpm)} - ${Math.round(maxBpm)}`;
    };

    return {
      mhr,
      zones: [
        {
          name: '১. ওয়ার্ম আপ জোনসমূহ (৫০% - ৬০%)',
          desc: 'হালকা অ্যাক্টিভিটি, হৃদযন্ত্র ও পেশীর মৃদু সক্রিয়করণ।',
          range: getZoneRange(0.50, 0.60),
          colorClass: 'border-blue-100 bg-blue-50/40 text-blue-800'
        },
        {
          name: '২. ফ্যাট বার্ন জোনসমূহ (৬০% - ৭০%)',
          desc: 'মাঝারি পরিশ্রম, যা শরীর থেকে সর্বোচ্চ ফ্যাট বা চর্বি গলাতে সহায়ক।',
          range: getZoneRange(0.60, 0.70),
          colorClass: 'border-emerald-100 bg-emerald-50/40 text-emerald-800'
        },
        {
          name: '৩. অ্যারোবিক বা কার্ডিও জোনসমূহ (৭০% - ৮০%)',
          desc: 'সহনশীলতা বাড়ানো এবং হৃদযন্ত্রের কার্যক্ষমতা ও ফুসফুস শক্তিশালীকরণ।',
          range: getZoneRange(0.70, 0.80),
          colorClass: 'border-yellow-100 bg-yellow-50/40 text-yellow-800'
        },
        {
          name: '৪. অ্যানেরোবিক বা পিক কর্মক্ষমতা জোনসমূহ (৮০% - ৯০%)',
          desc: 'তীব্র গতিশীল খেলা বা কার্ডিও, পেশীর শক্তি ও গতি বৃদ্ধি করে।',
          range: getZoneRange(0.80, 0.90),
          colorClass: 'border-red-100 bg-red-50/40 text-red-800'
        }
      ]
    };
  };

  const result = calculateHeartRate();

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">হৃদস্পন্দন (Heart Rate) ক্যালকুলেটর</h2>
          <p className="text-xs text-gray-500">আপনার বয়স ও বিশ্রামকালীন পালস রেট অনুযায়ী সর্বোচ্চ হার্ট রেট জোনসমূহ হিসাব করুন</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-sm font-black text-red-600">❤️ হার্ট রেট ইনপুট করুন</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">আপনার বয়স (বছর)</label>
              <input 
                type="number" 
                value={age || ""} 
                onChange={e => setAge(e.target.value)} 
                className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" 
                min="1" 
                max="120"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">বিশ্রামকালীন পালস রেট (Resting Heart Rate - BPM)</label>
              <input 
                type="number" 
                value={restingHr || ""} 
                onChange={e => setRestingHr(e.target.value)} 
                className="w-full border-gray-200 rounded-xl bg-gray-50 p-2.5 text-sm" 
                placeholder="ডিফল্ট ৭০" 
                min="40" 
                max="120"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">💡 ঘুম থেকে ওঠার পর শান্ত অবস্থায় হাতের কব্জি বা গলায় পালস গুনে এই মান দিতে পারেন।</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-red-600 mb-4">📊 টার্গেট হার্ট রেট জোনসমূহ</h3>

            {result ? (
              <div className="space-y-4">
                <div className="border border-red-100 bg-red-50/50 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-bold text-red-800 block">আপনার সর্বোচ্চ হৃদস্পন্দন হার (MHR)</span>
                  <span className="text-2xl font-black text-red-600">{toBn(result.mhr)} BPM</span>
                  <span className="text-[9px] block text-slate-400">বীটস প্রতি মিনিটে (Beats Per Minute)</span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-700 block">🏋️ আপনার লক্ষ্যভিত্তিক ব্যায়ামের সঠিক পালস রেট জোনসমূহ:</span>
                  
                  <div className="space-y-2">
                    {result.zones.map((zone, idx) => (
                      <div key={idx} className={`border p-3 rounded-xl flex justify-between items-center ${zone.colorClass}`}>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold">{zone.name}</p>
                          <p className="text-[10px] opacity-80 leading-relaxed font-semibold">{zone.desc}</p>
                        </div>
                        <span className="text-xs font-black whitespace-nowrap bg-white/80 px-2.5 py-1 rounded-lg shadow-sm">
                          {toBn(zone.range)} BPM
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Heart size={32} className="mb-2 animate-pulse text-red-400" />
                <p className="text-xs">আপনার বয়স ইনপুট দিলে এখানে হার্ট রেট জোনসমূহ প্রদর্শিত হবে।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
//            EDUCATION CALCULATORS
// ==========================================

// ---------------- GPA Calculator (জিপিএ ক্যালকুলেটর) ----------------
function GPACalculator({ onGoBack }: { onGoBack: () => void }) {
  const [scale, setScale] = useState<'5' | '4'>('5');
  const [hasFourthSubject, setHasFourthSubject] = useState(true);
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'বাংলা', grade: 'A+', isFourth: false },
    { id: 2, name: 'ইংরেজি', grade: 'A', isFourth: false },
    { id: 3, name: 'গণিত', grade: 'A+', isFourth: false },
    { id: 4, name: 'পদার্থবিজ্ঞান', grade: 'A-', isFourth: false },
    { id: 5, name: 'রসায়ন', grade: 'A+', isFourth: true },
  ]);

  const gradePointsScale5: Record<string, number> = {
    'A+': 5.0, 'A': 4.0, 'A-': 3.5, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0
  };

  const gradePointsScale4: Record<string, number> = {
    'A+': 4.0, 'A': 3.75, 'A-': 3.5, 'B+': 3.25, 'B': 3.0, 'B-': 2.75, 'C+': 2.5, 'C': 2.25, 'D': 2.0, 'F': 0.0
  };

  const grades = scale === '5' ? Object.keys(gradePointsScale5) : Object.keys(gradePointsScale4);

  const addSubject = () => {
    const nextId = subjects.length > 0 ? Math.max(...subjects.map(s => s.id)) + 1 : 1;
    setSubjects([...subjects, { id: nextId, name: `বিষয়সমূহ ${nextId}`, grade: 'A+', isFourth: false }]);
  };

  const removeSubject = (id: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const updateSubject = (id: number, field: string, value: any) => {
    setSubjects(subjects.map(s => {
      if (s.id === id) {
        if (field === 'isFourth' && value === true) {
          return { ...s, [field]: value };
        }
        return { ...s, [field]: value };
      }
      if (field === 'isFourth' && value === true && s.id !== id) {
        return { ...s, isFourth: false };
      }
      return s;
    }));
  };

  const calculateGPA = () => {
    const pointsMap = scale === '5' ? gradePointsScale5 : gradePointsScale4;
    
    if (scale === '5') {
      let mainSubjects = subjects;
      let fourthSub = null;

      if (hasFourthSubject) {
        fourthSub = subjects.find(s => s.isFourth);
        mainSubjects = subjects.filter(s => !s.isFourth);
      }

      if (mainSubjects.length === 0) return 0;

      const hasFailed = mainSubjects.some(s => pointsMap[s.grade] === 0);
      if (hasFailed) return 0;

      let totalPoints = mainSubjects.reduce((sum, s) => sum + pointsMap[s.grade], 0);
      
      if (fourthSub) {
        const fourthPoints = pointsMap[fourthSub.grade];
        if (fourthPoints > 2.0) {
          totalPoints += (fourthPoints - 2.0);
        }
      }

      const gpa = totalPoints / mainSubjects.length;
      return Math.min(5.0, Math.round(gpa * 100) / 100);
    } else {
      const totalPoints = subjects.reduce((sum, s) => sum + pointsMap[s.grade], 0);
      const gpa = totalPoints / subjects.length;
      return Math.round(gpa * 100) / 100;
    }
  };

  const gpa = calculateGPA();

  const getGPARemark = (val: number) => {
    if (val === 5.0 && scale === '5') return { text: 'অসাধারণ! আপনি জিপিএ ৫.০০ পেয়েছেন। 🎉', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (val >= 4.0) return { text: 'চমৎকার ফলাফল! আপনার পড়াশোনা অব্যাহত রাখুন। 👍', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (val >= 3.0) return { text: 'ভালো ফলাফল! আরও ভালো করার সুযোগ রয়েছে। 💪', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (val > 0) return { text: 'পাস করেছেন, তবে আরও অনেক মনোযোগ দিয়ে পড়তে হবে। 📖', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { text: 'দুঃখিত, এক বা একাধিক বিষয়সমূহে অকৃতকার্য হয়েছেন। নতুন উদ্যমে চেষ্টা করুন। 🥺', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const remark = getGPARemark(gpa);

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <Award className="w-6 h-6" /> জিপিএ (GPA) ক্যালকুলেটর
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">শিক্ষা সহায়ক</span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex gap-4 border-b pb-4">
            <button
              onClick={() => { setScale('5'); setSubjects(subjects.map(s => ({ ...s, grade: 'A+' }))); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${scale === '5' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              SSC / HSC (স্কেল ৫.০০)
            </button>
            <button
              onClick={() => { setScale('4'); setSubjects(subjects.map(s => ({ ...s, grade: 'A+' }))); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${scale === '4' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              বিশ্ববিদ্যালয় (স্কেল ৪.০০)
            </button>
          </div>

          {scale === '5' && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">৪র্থ বিষয়সমূহ (4th Subject) হিসাব করুন?</span>
                <p className="text-[10px] text-slate-500">৪র্থ বিষয়সমূহের অতিরিক্ত ২ ইস্টার মূল জিপিএ-তে যুক্ত হবে।</p>
              </div>
              <input
                type="checkbox"
                checked={hasFourthSubject}
                onChange={(e) => setHasFourthSubject(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-700">বিষয়সমূহের তালিকা:</span>
              <button
                onClick={addSubject}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <Plus size={14} /> বিষয়সমূহ যোগ করুন
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {subjects.map((sub, index) => (
                <div key={sub.id} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                  <span className="text-xs font-bold text-slate-400 min-w-[20px] text-center">
                    {toBn(index + 1)}
                  </span>
                  
                  <input
                    type="text"
                    value={sub.name || ""}
                    onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-emerald-500"
                    placeholder="বিষয়সমূহের নাম"
                  />

                  <select
                    value={sub.grade || ""}
                    onChange={(e) => updateSubject(sub.id, 'grade', e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {grades.map(g => (
                      <option key={g} value={g || ""}>{g}</option>
                    ))}
                  </select>

                  {scale === '5' && hasFourthSubject && (
                    <label className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-lg border border-slate-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sub.isFourth}
                        onChange={(e) => updateSubject(sub.id, 'isFourth', e.target.checked)}
                        className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
                      />
                      <span className="text-[10px] font-black text-slate-600">৪র্থ</span>
                    </label>
                  )}

                  <button
                    onClick={() => removeSubject(sub.id)}
                    disabled={subjects.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center text-center justify-center min-h-[220px]">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">আপনার জিপিএ (GPA)</span>
            
            <div className="relative flex items-center justify-center my-4">
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-emerald-200 flex flex-col items-center justify-center bg-white shadow-inner">
                <span className="text-4xl font-black text-emerald-600">{toBn(gpa.toFixed(2))}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">আউট অফ {toBn(scale)}.০০</span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-bold w-full leading-relaxed ${remark.color}`}>
              {remark.text}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3">
            <span className="text-xs font-black text-slate-700 block">📊 গ্রেড ইস্টার বিবরণী:</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <div className="bg-white p-2.5 rounded-xl flex justify-between border border-slate-100">
                <span className="text-slate-500">মোট বিষয়সমূহ:</span>
                <span className="font-bold text-slate-800">{toBn(subjects.length)} টি</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl flex justify-between border border-slate-100">
                <span className="text-slate-500">৪র্থ বিষয়সমূহ সহ:</span>
                <span className="font-bold text-slate-800">{scale === '5' && hasFourthSubject && subjects.some(s => s.isFourth) ? 'হ্যাঁ' : 'না'}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 leading-relaxed font-semibold bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-100">
              💡 <span className="font-bold">টিপস:</span> এসএসসি বা এইচএসসি পরীক্ষায় জিপিএ হিসাব করার ক্ষেত্রে আবশ্যিক বিষয়সমূহগুলোতে ফেইল (F গ্রেড) থাকলে সামগ্রিক ফলাফল জিপিএ ০.০০ (ফেইল) হিসেবে গণ্য হবে।
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- CGPA Calculator (সিজিপিএ ক্যালকুলেটর) ----------------
function CGPACalculator({ onGoBack }: { onGoBack: () => void }) {
  const [semesters, setSemesters] = useState([
    { id: 1, name: '১ম সেমিস্টারসমূহ', gpa: '3.75', credits: '18' },
    { id: 2, name: '২য় সেমিস্টারসমূহ', gpa: '3.80', credits: '18' },
    { id: 3, name: '৩য় সেমিস্টারসমূহ', gpa: '3.90', credits: '20' },
  ]);

  const addSemester = () => {
    const nextId = semesters.length > 0 ? Math.max(...semesters.map(s => s.id)) + 1 : 1;
    setSemesters([...semesters, { id: nextId, name: `${toBn(nextId)}ম সেমিস্টারসমূহ`, gpa: '3.50', credits: '18' }]);
  };

  const removeSemester = (id: number) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter(s => s.id !== id));
    }
  };

  const updateSemester = (id: number, field: string, value: string) => {
    setSemesters(semesters.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculateCGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    for (const sem of semesters) {
      const gpaVal = parseFloat(sem.gpa) || 0;
      const creditVal = parseFloat(sem.credits) || 0;
      totalPoints += gpaVal * creditVal;
      totalCredits += creditVal;
    }

    if (totalCredits === 0) return { cgpa: 0, totalCredits: 0 };
    return {
      cgpa: Math.round((totalPoints / totalCredits) * 100) / 100,
      totalCredits
    };
  };

  const { cgpa, totalCredits } = calculateCGPA();

  const getCGPARemark = (val: number) => {
    if (val >= 3.8) return { text: 'অসাধারণ একাডেমিক পারফরম্যান্স! আপনি ফার্স্ট ক্লাস অনার্স মানের ফলাফল করছেন। 👑', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (val >= 3.5) return { text: 'খুব চমৎকার ফলাফল! আপনার চমৎকার প্রচেষ্টা অব্যাহত রাখুন। 🌟', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (val >= 3.0) return { text: 'ভালো ফলাফল! আপনার পরবর্তী সেমিস্টারসমূহগুলোতে আরও মনোযোগী হলে সিজিপিএ আরও বাড়বে। 👍', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { text: 'উন্নতির সুযোগ আছে। আপনার পড়ালেখার পরিকল্পনা নতুনভাবে সাজান। 📚', color: 'text-orange-700 bg-orange-50 border-orange-200' };
  };

  const remark = getCGPARemark(cgpa);

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <GraduationCap className="w-6 h-6" /> সিজিপিএ (CGPA) ক্যালকুলেটর
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">বিশ্ববিদ্যালয় উপযোগী</span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-700">সেমিস্টারসমূহের তথ্য দিন:</span>
            <button
              onClick={addSemester}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus size={14} /> সেমিস্টারসমূহ যোগ করুন
            </button>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {semesters.map((sem, index) => (
              <div key={sem.id} className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 items-center">
                <div className="col-span-4">
                  <input
                    type="text"
                    value={sem.name || ""}
                    onChange={(e) => updateSemester(sem.id, 'name', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-blue-500"
                    placeholder="সেমিস্টারসমূহ নাম"
                  />
                </div>
                
                <div className="col-span-4 flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 focus-within:border-blue-500">
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">SGPA:</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={sem.gpa || ""}
                    onChange={(e) => updateSemester(sem.id, 'gpa', e.target.value)}
                    className="w-full bg-transparent border-none text-xs font-black focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div className="col-span-3 flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 focus-within:border-blue-500">
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">ক্রেডিট:</span>
                  <input
                    type="number"
                    min="0"
                    value={sem.credits || ""}
                    onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
                    className="w-full bg-transparent border-none text-xs font-black focus:outline-none"
                    placeholder="0"
                  />
                </div>

                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => removeSemester(sem.id)}
                    disabled={semesters.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center text-center justify-center min-h-[220px]">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">আপনার মোট সিজিপিএ (CGPA)</span>
            
            <div className="relative flex items-center justify-center my-4">
              <div className="w-32 h-32 rounded-full border-4 border-blue-500 border-t-indigo-200 flex flex-col items-center justify-center bg-white shadow-lg">
                <span className="text-4xl font-black text-blue-600">{toBn(cgpa.toFixed(2))}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">আউট অফ ৪.০০</span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-bold w-full leading-relaxed ${remark.color}`}>
              {remark.text}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3">
            <span className="text-xs font-black text-slate-700 block">📊 সামগ্রিক তথ্য:</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <div className="bg-white p-2.5 rounded-xl flex justify-between border border-slate-100">
                <span className="text-slate-500">মোট সেমিস্টারসমূহ:</span>
                <span className="font-bold text-slate-800">{toBn(semesters.length)} টি</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl flex justify-between border border-slate-100">
                <span className="text-slate-500">মোট সম্পন্ন ক্রেডিট:</span>
                <span className="font-bold text-slate-800">{toBn(totalCredits)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Grade Calculator (গ্রেড ক্যালকুলেটর) ----------------
function GradeCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [calcType, setCalcType] = useState<'convert' | 'goal'>('convert');
  const [marks, setMarks] = useState('75');
  const [system, setSystem] = useState<'school' | 'university'>('school');

  const [currentScore, setCurrentScore] = useState('80');
  const [currentWeight, setCurrentWeight] = useState('40');
  const [targetGrade, setTargetGrade] = useState('A+');

  const sscGradeMap = [
    { min: 80, max: 100, letter: 'A+', point: 5.0, remark: 'অসাধারণ (Outstanding)' },
    { min: 70, max: 79, letter: 'A', point: 4.0, remark: 'চমৎকার (Excellent)' },
    { min: 60, max: 69, letter: 'A-', point: 3.5, remark: 'খুব ভালো (Very Good)' },
    { min: 50, max: 59, letter: 'B', point: 3.0, remark: 'ভালো (Good)' },
    { min: 40, max: 49, letter: 'C', point: 2.0, remark: 'চলতি মান (Satisfactory)' },
    { min: 33, max: 39, letter: 'D', point: 1.0, remark: 'পাস (Passing)' },
    { min: 0, max: 32, letter: 'F', point: 0.0, remark: 'অকৃতকার্য (Fail)' },
  ];

  const uniGradeMap = [
    { min: 80, max: 100, letter: 'A+', point: 4.0, remark: 'Outstanding' },
    { min: 75, max: 79, letter: 'A', point: 3.75, remark: 'Excellent' },
    { min: 70, max: 74, letter: 'A-', point: 3.5, remark: 'Very Good' },
    { min: 65, max: 69, letter: 'B+', point: 3.25, remark: 'Good' },
    { min: 60, max: 64, letter: 'B', point: 3.0, remark: 'Satisfactory' },
    { min: 55, max: 59, letter: 'B-', point: 2.75, remark: 'Above Average' },
    { min: 50, max: 54, letter: 'C+', point: 2.50, remark: 'Average' },
    { min: 45, max: 49, letter: 'C', point: 2.25, remark: 'Below Average' },
    { min: 40, max: 44, letter: 'D', point: 2.00, remark: 'Passing' },
    { min: 0, max: 39, letter: 'F', point: 0.0, remark: 'Fail' },
  ];

  const getConversionResult = () => {
    const val = parseInt(marks) || 0;
    const map = system === 'school' ? sscGradeMap : uniGradeMap;
    const res = map.find(g => val >= g.min && val <= g.max);
    return res || { letter: 'F', point: 0.0, remark: 'অকৃতকার্য (Fail)' };
  };

  const getGoalResult = () => {
    const cur = parseFloat(currentScore) || 0;
    const curW = parseFloat(currentWeight) || 0;
    const finalW = 100 - curW;

    if (curW <= 0 || curW >= 100) return null;

    let targetTotal = 80;
    if (targetGrade === 'A') targetTotal = 70;
    if (targetGrade === 'A-') targetTotal = 60;
    if (targetGrade === 'B') targetTotal = 50;
    if (targetGrade === 'C') targetTotal = 40;
    if (targetGrade === 'D') targetTotal = 33;

    const currentContribution = cur * (curW / 100);
    const neededFromFinalTotal = targetTotal - currentContribution;
    const neededPercentInFinal = (neededFromFinalTotal / finalW) * 100;

    return {
      neededPercent: Math.max(0, Math.round(neededPercentInFinal * 10) / 10),
      currentContribution: Math.round(currentContribution * 10) / 10,
      targetTotal
    };
  };

  const convResult = getConversionResult();
  const goalResult = getGoalResult();

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> গ্রেড (Grade) ক্যালকুলেটর
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">লেটার গ্রেড রূপান্তর</span>
      </div>

      <div className="p-6">
        <div className="flex gap-4 border-b pb-4 mb-6">
          <button
            onClick={() => setCalcType('convert')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${calcType === 'convert' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            নম্বর থেকে গ্রেড রূপান্তর
          </button>
          <button
            onClick={() => setCalcType('goal')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${calcType === 'goal' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            কাঙ্ক্ষিত গ্রেড লক্ষ্য নির্ধারণী
          </button>
        </div>

        {calcType === 'convert' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-2">শিক্ষা ব্যবস্থা সিলেক্ট করুন:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSystem('school')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border ${system === 'school' ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    মাধ্যমিক / উচ্চ মাধ্যমিক
                  </button>
                  <button
                    onClick={() => setSystem('university')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border ${system === 'university' ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    বিশ্ববিদ্যালয়
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">প্রাপ্ত নম্বর দিন (১০০ এর মধ্যে):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marks || ""}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none focus:border-purple-500"
                  placeholder="যেমন: ৭৫"
                />
              </div>

              <div className="border rounded-2xl p-3 bg-slate-50 border-slate-100 space-y-1">
                <span className="text-[10px] font-black text-slate-500 block uppercase">গ্রেডিং স্কেল বিবরণী ({system === 'school' ? '৫.০০' : '৪.০০'} স্কেল)</span>
                <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                  {(system === 'school' ? sscGradeMap : uniGradeMap).map((g, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] bg-white p-1.5 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-600">{toBn(g.min)}-{toBn(g.max)} নম্বর</span>
                      <span className="font-black text-purple-700">{g.letter} ({toBn(g.point.toFixed(2))})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-500 uppercase">ফলাফল গ্রেড</span>
              
              <div className="text-6xl font-black text-purple-600 my-4 bg-white px-8 py-4 rounded-3xl shadow-sm border border-slate-100">
                {convResult.letter}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-black text-slate-800">গ্রেড ইস্টার: {toBn(convResult.point.toFixed(2))}</p>
                <p className="text-xs text-slate-500 font-bold">{convResult.remark}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">এ পর্যন্ত প্রাপ্ত স্কোর (%) (যেমন: কুইজ বা মিডটার্ম):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={currentScore || ""}
                  onChange={(e) => setCurrentScore(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none focus:border-purple-500"
                  placeholder="যেমন: ৮০"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">এ পর্যন্ত সম্পন্ন মূল্যায়নের মোট ওজন বা ওয়েট (Weight %):</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={currentWeight || ""}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none focus:border-purple-500"
                  placeholder="যেমন: ৪০ (যদি মিডটার্ম ও অ্যাসাইনমেন্ট ৪০% বহন করে)"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-2">আপনার কাঙ্ক্ষিত গ্রেড লক্ষ্য সিলেক্ট করুন:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['A+', 'A', 'A-', 'B', 'C', 'D'].map(g => (
                    <button
                      key={g}
                      onClick={() => setTargetGrade(g)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-colors ${targetGrade === g ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center">
              {goalResult ? (
                <>
                  <span className="text-xs font-bold text-slate-500 uppercase">ফাইনালে সর্বনিম্ন প্রয়োজনীয় স্কোর</span>
                  
                  <div className="my-4 text-center">
                    {goalResult.neededPercent <= 100 ? (
                      <div className="space-y-1">
                        <span className="text-4xl font-black text-purple-600 block bg-white px-6 py-3 rounded-2xl border border-slate-100">
                          {toBn(goalResult.neededPercent)}%
                        </span>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                          বাকি {toBn(100 - parseInt(currentWeight))}% ওজনের ফাইনাল পরীক্ষায় আপনাকে অন্তত এই শতাংশ পেতে হবে।
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-lg font-black text-red-600 block bg-white px-4 py-3 rounded-2xl border border-slate-100">
                          অর্জন করা সম্ভব নয় 🥺
                        </span>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                          কাঙ্ক্ষিত গ্রেড পেতে হলে ফাইনালে ১০০% এর চেয়েও বেশি নম্বর প্রয়োজন।
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-slate-600 space-y-1">
                    <p>আপনার বর্তমান স্কোর কন্ট্রিবিউশন: {toBn(goalResult.currentContribution)}%</p>
                    <p>টার্গেট গ্রেডের সর্বনিম্ন নম্বর থ্রেশহোল্ড: {toBn(goalResult.targetTotal)}%</p>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 font-bold">যথাযথ তথ্য প্রদান করুন</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- Study Timer (পড়াশোনা টাইমার) ----------------
function StudyTimer({ onGoBack }: { onGoBack: () => void }) {
  const [mode, setMode] = useState<'study' | 'shortBreak' | 'longBreak'>('study');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [customStudy, setCustomStudy] = useState('25');
  const [customShort, setCustomShort] = useState('5');
  const [customLong, setCustomLong] = useState('15');

  const [history, setHistory] = useState<{ id: number; type: string; timestamp: string }[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const modeLabels = {
    study: 'পড়াশোনা সেশন 📖',
    shortBreak: 'ছোট বিরতি ☕',
    longBreak: 'বড় বিরতি 🧘'
  };

  const modeDurations = {
    study: parseInt(customStudy) * 60,
    shortBreak: parseInt(customShort) * 60,
    longBreak: parseInt(customLong) * 60
  };

  const quotes = [
    "পড়াশোনা করো, নিজেকে গড়ার এটাই মোক্ষম সময়।",
    "আজকের পরিশ্রম আগামীকালের সাফল্যের ভিত্তি স্থাপন করে।",
    "ধৈর্য ও অধ্যাবসায়ই শিক্ষার কঠিন পথকে সহজ করে তোলে।",
    "সাফল্য একদিনে আসে না, প্রতিদিন একটু একটু করে এগোতে হয়।",
    "মনোযোগ হলো এক ধরণের পেশী, অনুশীলনের মাধ্যমে একে আরও উন্নত করুন।"
  ];

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * quotes.length));
  }, [mode]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, mode]);

  useEffect(() => {
    setSecondsLeft(modeDurations[mode]);
    setIsActive(false);
  }, [mode, customStudy, customShort, customLong]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (soundEnabled) {
      playChime();
    }
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: 'numeric', second: 'numeric' });
    setHistory(prev => [
      { id: Date.now(), type: modeLabels[mode], timestamp: timeStr },
      ...prev
    ]);

    alert(`${modeLabels[mode]} সম্পন্ন হয়েছে!`);
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(modeDurations[mode]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalDuration = modeDurations[mode];
  const progressPercent = totalDuration > 0 ? ((totalDuration - secondsLeft) / totalDuration) * 100 : 0;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-red-500 to-rose-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <Timer className="w-6 h-6" /> পড়াশোনা টাইমার (Study Timer)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">পোমোডোরো পদ্ধতি</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 flex flex-col items-center justify-center space-y-6">
          <div className="flex gap-2 w-full max-w-sm justify-center bg-slate-50 p-1 rounded-xl border border-slate-100">
            {(['study', 'shortBreak', 'longBreak'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${mode === m ? 'bg-red-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {m === 'study' ? 'পড়ালেখা' : m === 'shortBreak' ? 'ছোট বিরতি' : 'বড় বিরতি'}
              </button>
            ))}
          </div>

          <div className="relative flex items-center justify-center">
            <svg className="w-64 h-64 transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="110"
                className="stroke-slate-100 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                className="stroke-red-500 fill-none transition-all duration-1000 ease-linear"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 110}
                strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-4xl font-black text-slate-800 tracking-wider">
                {toBn(formatTime(secondsLeft))}
              </span>
              <span className="text-[10px] font-black text-red-500 uppercase mt-1 tracking-wider">
                {modeLabels[mode]}
              </span>
            </div>
          </div>

          <div className="flex gap-4 w-full justify-center max-w-sm">
            <button
              onClick={toggleTimer}
              className={`flex-1 py-3 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${isActive ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
            >
              {isActive ? <Pause size={16} /> : <Play size={16} />}
              {isActive ? 'বিরতি নিন' : 'শুরু করুন'}
            </button>
            
            <button
              onClick={resetTimer}
              className="bg-slate-100 text-slate-600 hover:bg-slate-200 p-3 rounded-2xl transition-all"
              title="রিসেট"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="bg-red-50 text-red-800 p-4 rounded-2xl text-xs font-semibold max-w-md text-center italic border border-red-100 leading-relaxed">
            💬 "{quotes[quoteIndex]}"
          </div>
        </div>

        <div className="md:col-span-5 space-y-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-4">
            <span className="text-xs font-black text-slate-700 block">⚙️ টাইমার কাস্টমাইজ করুন:</span>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-600">পড়ালেখার সময় (মিনিট):</span>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customStudy || ""}
                  onChange={(e) => setCustomStudy(e.target.value)}
                  className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center font-black focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-600">ছোট বিরতি (মিনিট):</span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customShort || ""}
                  onChange={(e) => setCustomShort(e.target.value)}
                  className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center font-black focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-600">বড় বিরতি (মিনিট):</span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customLong || ""}
                  onChange={(e) => setCustomLong(e.target.value)}
                  className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center font-black focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-700">শব্দ সংকেত চালু রাখুন?</span>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 accent-red-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3">
            <span className="text-xs font-black text-slate-700 block">📊 আজকের সম্পন্ন সেশনসমূহ:</span>
            {history.length > 0 ? (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {history.map((h) => (
                  <div key={h.id} className="flex justify-between text-[10px] bg-white p-2 rounded-xl border border-slate-100">
                    <span className="font-black text-slate-700">{h.type}</span>
                    <span className="text-slate-400 font-bold">{toBn(h.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 font-bold py-4 text-center">এখনো কোনো সেশন সম্পন্ন হয়নি।</p>
            )}
          </div>
        </div>
      </div>
      <div className="text-center text-slate-500 text-xs py-12 border-t border-slate-100 mt-12">
        নিয়মিত নতুন টুল যোগ করা হচ্ছে। আপনার প্রয়োজনীয় টুলের পরামর্শ দিন।
      </div>
    </div>
  );
}

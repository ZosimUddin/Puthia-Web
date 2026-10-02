import React, { useState, useMemo, useEffect } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Search, MapPin, Phone, Globe, Download, 
  Star, Share2, ArrowLeft, ExternalLink, FileText, Award, Gift,
  Landmark, BookOpen, School, Building, UserCheck, Calendar,
  Megaphone, PlayCircle, HelpCircle, Heart, PhoneCall, Copy, Check
} from 'lucide-react';
import { toast } from 'sonner';
import ModulePageLayout from '../../../components/common/ModulePageLayout';

// Subpage configurations with localized Bangla titles & icons
const CATEGORY_META: { [key: string]: { title: string, subtitle: string, color: string, icon: React.ReactNode } } = {
  'results': {
    title: 'SSC/HSC ফলাফল',
    subtitle: 'অনলাইনে ও এসএমএস এর মাধ্যমে দ্রুত পরীক্ষার ফলাফল ও মার্কশিট দেখুন',
    color: 'from-blue-600 to-cyan-700',
    icon: <Award className="w-12 h-12 text-white" />
  },
  'admission': {
    title: 'ভর্তি তথ্য',
    subtitle: 'স্কুল, কলেজ, বিশ্ববিদ্যালয়, মেডিকেল ও পলিটেকনিকে ভর্তির আবেদনের বিস্তারিত',
    color: 'from-emerald-600 to-teal-700',
    icon: <School className="w-12 h-12 text-white" />
  },
  'scholarship': {
    title: 'উপবৃত্তি ও বৃত্তি',
    subtitle: 'মেধাবৃত্তি, সরকারি বৃত্তি এবং দেশী-বিদেশী উচ্চশিক্ষার বৃত্তির আবেদন ও ফলাফল',
    color: 'from-amber-500 to-orange-600',
    icon: <Gift className="w-12 h-12 text-white" />
  },
  'board': {
    title: 'শিক্ষা বোর্ড ',
    subtitle: 'রাজশাহী বোর্ড সহ দেশের সকল বোর্ডের গুরুত্বপূর্ণ তথ্য ও নোটিশ',
    color: 'from-indigo-600 to-purple-700',
    icon: <Landmark className="w-12 h-12 text-white" />
  },
  'books': {
    title: 'বই (NCTB)',
    subtitle: '১ম শ্রেণী থেকে দ্বাদশ শ্রেণীর সকল বিষয়ের সরকারি বইয়ের পিডিএফ',
    color: 'from-pink-600 to-rose-700',
    icon: <BookOpen className="w-12 h-12 text-white" />
  },
  'ebooks': {
    title: 'ই-বুক ও নোট',
    subtitle: 'লেকচার শিট, হ্যান্ড নোট, শিক্ষক বাতায়ন ও কিশোর বাতায়নের শিক্ষামূলক কন্টেন্ট',
    color: 'from-violet-600 to-indigo-700',
    icon: <FileText className="w-12 h-12 text-white" />
  },
  'schools-colleges': {
    title: 'স্কুল ও কলেজ তালিকা',
    subtitle: 'পুঠিয়া উপজেলার সকল নামকরা স্কুল ও কলেজের তথ্য, অবস্থান ও যোগাযোগ',
    color: 'from-teal-600 to-emerald-700',
    icon: <Building className="w-12 h-12 text-white" />
  },
  'universities': {
    title: 'বিশ্ববিদ্যালয় তালিকা',
    subtitle: 'রাজশাহী বিশ্ববিদ্যালয় সহ দেশের সকল সরকারি ও বেসরকারি বিশ্ববিদ্যালয়',
    color: 'from-blue-700 to-indigo-900',
    icon: <GraduationCap className="w-12 h-12 text-white" />
  },
  'ntrca-exam': {
    title: 'শিক্ষক নিবন্ধন (NTRCA)',
    subtitle: 'বেসরকারি শিক্ষক নিবন্ধন পরীক্ষা, সিলেবাস, ফলাফল ও নিয়োগ সুপারিশ',
    color: 'from-slate-700 to-neutral-900',
    icon: <UserCheck className="w-12 h-12 text-white" />
  },
  'exam-routine': {
    title: 'পরীক্ষার রুটিন',
    subtitle: 'এসএসসি, এইচএসসি, জাতীয় বিশ্ববিদ্যালয় ও বোর্ড ের পরীক্ষার সময়সূচী',
    color: 'from-purple-600 to-pink-700',
    icon: <Calendar className="w-12 h-12 text-white" />
  },
  'notices': {
    title: 'শিক্ষা নোটিশ',
    subtitle: 'শিক্ষা মন্ত্রণালয়, মাউশি, প্রাথমিক ও গণশিক্ষা বিভাগের সর্বশেষ নোটিশ',
    color: 'from-red-600 to-orange-700',
    icon: <Megaphone className="w-12 h-12 text-white" />
  },
  'online-classes': {
    title: 'অনলাইন ক্লাস',
    subtitle: 'সংসদ টিভি ক্লাস, কিশোর বাতায়ন ও বিভিন্ন অনলাইন ক্লাস প্ল্যাটফর্মের লিংক',
    color: 'from-sky-500 to-blue-700',
    icon: <PlayCircle className="w-12 h-12 text-white" />
  },
  'competitions': {
    title: 'অলিম্পিয়াড/প্রতিযোগিতা',
    subtitle: 'গণিত অলিম্পিয়াড, কুইজ ও বিভিন্ন জাতীয় ও আন্তর্জাতিক প্রতিযোগিতার তথ্য',
    color: 'from-amber-600 to-red-600',
    icon: <Award className="w-12 h-12 text-white" />
  },
  'faq': {
    title: 'শিক্ষা FAQ',
    subtitle: 'পরীক্ষা, ভর্তি, উপবৃত্তি ও শিক্ষা পোর্টাল সম্পর্কিত সচরাচর জিজ্ঞাসা ও উত্তর',
    color: 'from-teal-700 to-cyan-900',
    icon: <HelpCircle className="w-12 h-12 text-white" />
  }
};

interface EducationItem {
  id: string;
  name: string;
  description: string;
  phone?: string;
  website?: string;
  mapUrl?: string;
  downloadUrl?: string;
  isPdf?: boolean;
}

const EDUCATION_DATABASE: { [key: string]: EducationItem[] } = {
  'results': [
    {
      id: 'res-ssc',
      name: 'SSC/Dakhil Result (অফিসিয়াল পোর্টাল)',
      description: 'মাধ্যমিক স্কুল সার্টিফিকেট পরীক্ষার অফিসিয়াল ফলাফল দেখার পোর্টাল। রোল ও রেজিস্ট্রেশন নম্বর দিয়ে দ্রুত মার্কশিট সহ ফলাফল জানুন।',
      website: 'https://educationboardresults.gov.bd',
      phone: '16222',
      downloadUrl: 'https://rajshahieducationboard.gov.bd/files/ssc_guide.pdf',
      isPdf: true
    },
    {
      id: 'res-hsc',
      name: 'HSC/Alim Result (অফিসিয়াল পোর্টাল)',
      description: 'উচ্চ মাধ্যমিক সার্টিফিকেট পরীক্ষার ফলাফল ও মার্কশিট ডাউনলোডের কেন্দ্রীয় লিংক। সরাসরি ও সাবলীল সার্ভার।',
      website: 'https://eboardresults.com',
      phone: '16222'
    },
    {
      id: 'res-jsc',
      name: 'JSC/JDC Result (আর্কাইভ)',
      description: 'জুনিয়র স্কুল সার্টিফিকেট ও মাদ্রাসার জুনিয়র দাখিল সার্টিফিকেট পরীক্ষার পূর্ববর্তী ফলাফল ও তথ্য আর্কাইভ পোর্টাল।',
      website: 'https://educationboardresults.gov.bd'
    },
    {
      id: 'res-marksheet',
      name: 'মার্কশিট ডাউনলোড (Rajshahi Board)',
      description: 'রাজশাহী শিক্ষা বোর্ডের শিক্ষার্থীদের জন্য নম্বরপত্র সহ বিস্তারিত ফলাফল এবং প্রাতিষ্ঠানিক ফলাফল ডাউনলোড করার বিশেষ পোর্টাল।',
      website: 'https://rajshahieducationboard.gov.bd/result',
      phone: '0721-772115'
    },
    {
      id: 'res-guide',
      name: 'ফলাফল দেখার নির্দেশিকা (SMS & Web Guide)',
      description: 'কীভাবে দ্রুত এসএমএস-এর মাধ্যমে ও অনলাইনে ফলাফল দেখতে পাবেন তার পূর্ণাঙ্গ অফিসিয়াল গাইড এবং মোবাইল নম্বর বিন্যাস নির্দেশিকা।',
      website: 'https://rajshahieducationboard.gov.bd',
      downloadUrl: 'https://rajshahieducationboard.gov.bd/files/result_check_guide.pdf',
      isPdf: true
    }
  ],
  'admission': [
    {
      id: 'adm-school',
      name: 'সরকারি ও বেসরকারি স্কুল ভর্তি (GSA Portal)',
      description: 'সারা দেশের সরকারি ও বেসরকারি মাধ্যমিক বিদ্যালয় ে ১ম শ্রেণী থেকে ৯ম শ্রেণীতে লটারি এবং ভর্তি আবেদনের অফিশিয়াল ওয়ান-স্টপ পোর্টাল।',
      website: 'https://gsa.teletalk.com.bd',
      phone: '121'
    },
    {
      id: 'adm-college',
      name: 'একাদশ শ্রেণীতে কলেজ ভর্তি (XI Class Admission)',
      description: 'এসএসসি উত্তীর্ণ শিক্ষার্থীদের জন্য একাদশ শ্রেণীতে সরকারি ও বেসরকারি কলেজে অনলাইনে আবেদন, মেধা তালিকা ও নিশ্চয়ন পোর্টাল।',
      website: 'http://www.xiclassadmission.gov.bd',
      phone: '01711122233'
    },
    {
      id: 'adm-varsity',
      name: 'বিশ্ববিদ্যালয় গুচ্ছ ভর্তি পরীক্ষা (GST Admission)',
      description: 'দেশের ২৪টি সাধারণ এবং বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের সমন্বিত গুচ্ছ ভর্তি পরীক্ষা, সিট প্ল্যান ও মেধা তালিকার অফিশিয়াল ওয়েবসাইট।',
      website: 'https://gstadmission.ac.bd',
      phone: '01712345678'
    },
    {
      id: 'adm-poly',
      name: 'পলিটেকনিক ভর্তি (BTEB Admission)',
      description: '৪ বছর মেয়াদী ডিপ্লোমা ইন ইঞ্জিনিয়ারিং, টেক্সটাইল ও অন্যান্য ডিপ্লোমা কোর্সে সরকারি পলিটেকনিকে অনলাইন ভর্তি ও চয়েস লকিং পোর্টাল।',
      website: 'http://www.btebadmission.gov.bd',
      phone: '01811223344'
    },
    {
      id: 'adm-medical',
      name: 'মেডিকেল ও ডেন্টাল ভর্তি (DGHS)',
      description: 'দেশের সরকারি ও বেসরকারি মেডিকেল কলেজ এবং ডেন্টাল ইউনিটে এমবিবিএস ও বিডিএস ভর্তি পরীক্ষার আবেদন ও ফলাফল জানার পোর্টাল।',
      website: 'https://dghs.teletalk.com.bd',
      phone: '01550155555'
    },
    {
      id: 'adm-agri',
      name: 'কৃষি বিশ্ববিদ্যালয় গুচ্ছ ভর্তি (Agri Cluster)',
      description: 'দেশের ৮টি সরকারি কৃষি ও কৃষি প্রধান বিশ্ববিদ্যালয়ের সমন্বিত গুচ্ছ ভর্তি পরীক্ষার সার্কুলার, আবেদন ও ফলাফল সংক্রান্ত পোর্টাল।',
      website: 'https://acas.edu.bd'
    }
  ],
  'scholarship': [
    {
      id: 'sch-pmeat',
      name: 'প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট (PMEAT)',
      description: 'দরিদ্র ও মেধাবী শিক্ষার্থীদের শিক্ষা নিশ্চিত করতে উপবৃত্তি, আর্থিক অনুদান এবং বিশেষ ট্রাস্ট ফেলোশিপের অফিশিয়াল অনলাইন আবেদন প্ল্যাটফর্ম।',
      website: 'http://www.pmeat.gov.bd',
      phone: '02-55138487',
      downloadUrl: 'http://www.pmeat.gov.bd/site/view/notices'
    },
    {
      id: 'sch-dshe',
      name: 'মাউশি মাধ্যমিক উপবৃত্তি ও বৃত্তি নোটিশ',
      description: 'মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর (DSHE) কর্তৃক ষষ্ঠ থেকে দ্বাদশ শ্রেণীর সাধারণ ও কারিগরি শিক্ষার্থীদের উপবৃত্তি অনুমোদন সংক্রান্ত আপডেট নোটিশ।',
      website: 'http://www.dshe.gov.bd',
      downloadUrl: 'http://www.dshe.gov.bd/site/view/notices'
    },
    {
      id: 'sch-board',
      name: 'রাজশাহী বোর্ড মেধা ও সাধারণ বৃত্তি তালিকা',
      description: 'রাজশাহী শিক্ষা বোর্ডের এসএসসি ও এইচএসসি পরীক্ষার ফলাফলের উপর ভিত্তি করে প্রকাশিত বৃত্তির অফিশিয়াল তালিকা ও গেজেট নোটিফিকেশন।',
      website: 'https://rajshahieducationboard.gov.bd',
      phone: '0721-772115',
      downloadUrl: 'https://rajshahieducationboard.gov.bd/notice',
      isPdf: true
    },
    {
      id: 'sch-ugc',
      name: 'UGC উচ্চশিক্ষা ও গবেষণা স্কলারশিপ',
      description: 'বিশ্ববিদ্যালয় মঞ্জুরী কমিশন (UGC) কর্তৃক স্নাতক ও স্নাতকোত্তর শিক্ষার্থীদের জন্য গবেষণা অনুদান এবং বিশেষ ডক্টরাল ফেলোশিপ স্কলারশিপ পোর্টাল।',
      website: 'https://www.ugc.gov.bd'
    },
    {
      id: 'sch-guide',
      name: 'উপবৃত্তি আবেদন গাইড ও ফরম',
      description: 'কীভাবে নির্ভুল উপবৃত্তির ফরম পূরণ করতে হবে, কী কী কাগজপত্র প্রয়োজন এবং আবেদনের শেষ তারিখ সংক্রান্ত সর্বশেষ গাইডলাইন।',
      website: 'http://www.pmeat.gov.bd',
      downloadUrl: 'http://www.pmeat.gov.bd/files/scholarship_manual.pdf',
      isPdf: true
    }
  ],
  'board': [
    {
      id: 'brd-rajshahi',
      name: 'রাজশাহী মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড',
      description: 'পুঠিয়া উপজেলার সকল শিক্ষা প্রতিষ্ঠান এই বোর্ডের অধীনে পরিচালিত হয়। পরীক্ষা ও সার্টিফিকেট সংশোধন সংক্রান্ত তথ্যের মূল সাইট।',
      website: 'https://rajshahieducationboard.gov.bd',
      phone: '0721-772115',
      mapUrl: 'https://maps.google.com/?q=Rajshahi+Education+Board'
    },
    {
      id: 'brd-dhaka',
      name: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ঢাকা',
      description: 'বাংলাদেশের অন্যতম প্রধান ও বৃহত্তম শিক্ষা বোর্ড। ঢাকা বোর্ডের নির্দেশিকা, প্রজ্ঞাপন এবং গেজেট নোটিশ দেখার প্ল্যাটফর্ম।',
      website: 'https://dhakaeducationboard.gov.bd',
      phone: '02-9669815'
    },
    {
      id: 'brd-technical',
      name: 'বাংলাদেশ কারিগরি শিক্ষা বোর্ড (BTEB)',
      description: 'কারিগরি, ভোকেশনাল ও ডিপ্লোমা শিক্ষা স্তরের পাঠ্যক্রম প্রণয়ন, পরীক্ষা পরিচালনা ও ফলাফল প্রকাশের মূল অফিশিয়াল বোর্ড।',
      website: 'http://www.bteb.gov.bd',
      phone: '02-55006525'
    },
    {
      id: 'brd-madrasah',
      name: 'বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড (BMEB)',
      description: 'ইবতেদায়ী, দাখিল ও আলিম স্তরের মাদ্রাসা শিক্ষা কারিকুলাম ও পরীক্ষা নিয়ন্ত্রণকারী বিশেষায়িত শিক্ষা বোর্ড।',
      website: 'http://www.bmeb.gov.bd',
      phone: '02-9612852'
    },
    {
      id: 'brd-ntrca',
      name: 'বেসরকারি শিক্ষক নিবন্ধন ও প্রত্যয়ন কর্তৃপক্ষ (NTRCA)',
      description: 'বেসরকারি স্কুল ও কলেজে শিক্ষকতা করতে ইচ্ছুক প্রার্থীদের নিবন্ধন পরীক্ষা এবং শিক্ষক নিয়োগ সুপারিশের কেন্দ্রীয় সরকারি প্রতিষ্ঠান।',
      website: 'http://www.ntrca.gov.bd',
      phone: '02-55045888',
      mapUrl: 'https://maps.google.com/?q=NTRCA+Office+Dhaka'
    }
  ],
  'books': [
    {
      id: 'bks-primary',
      name: 'প্রাথমিক স্তরের বই (NCTB Class 1-5)',
      description: 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড অনুমোদিত প্রথম থেকে পঞ্চম শ্রেণীর সকল বিষয়ের বাংলা ও ইংরেজি ভার্সনের মূল পাঠ্যবই।',
      website: 'http://www.nctb.gov.bd',
      downloadUrl: 'http://www.nctb.gov.bd/site/page/f403980c-9f65-42f0-9f5b-9d2a67e4125b',
      isPdf: true
    },
    {
      id: 'bks-high',
      name: 'মাধ্যমিক স্তরের বই (NCTB Class 6-10)',
      description: 'নতুন ও পুরাতন শিক্ষাক্রমের আলোকে ষষ্ঠ থেকে দশম শ্রেণীর সকল বিষয়ের নির্ভুল ডিজিটাল ও প্রিন্টযোগ্য পিডিএফ বইয়ের কালেকশন।',
      website: 'http://www.nctb.gov.bd',
      downloadUrl: 'http://www.nctb.gov.bd/site/page/876c24be-3773-40a2-aa90-b996128d5d4a',
      isPdf: true
    },
    {
      id: 'bks-hsc',
      name: 'উচ্চ মাধ্যমিক স্তরের বই (HSC Class 11-12)',
      description: 'একাদশ ও দ্বাদশ শ্রেণীর জন্য নির্ধারিত বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা শাখার সকল ট্রাংক বই এবং অনুমোদিত পাঠ্যপুস্তক পিডিএফ।',
      website: 'http://www.nctb.gov.bd',
      downloadUrl: 'http://www.nctb.gov.bd/site/page/b8b4b7c1-dbf2-4bc4-9464-9fbb34e0da19',
      isPdf: true
    },
    {
      id: 'bks-madrassa',
      name: 'মাদ্রাসা স্তরের বই (ইবতেদায়ী, দাখিল ও আলিম)',
      description: 'মাদ্রাসার জন্য বিশেষায়িত আরবী, ফিকহ, আকাইদ ও সাধারণ বিষয়ের সকল অনুমোদিত সরকারি বইয়ের অফিশিয়াল পিডিএফ লাইব্রেরি।',
      website: 'http://www.nctb.gov.bd',
      downloadUrl: 'http://www.nctb.gov.bd/site/page/4cc5ba8f-3cb1-443b-826d-bf2e3cd8c9b2',
      isPdf: true
    }
  ],
  'ebooks': [
    {
      id: 'ebk-batayon',
      name: 'শিক্ষক বাতায়ন (Teachers Portal)',
      description: 'বাংলাদেশের বৃহত্তম ডিজিটাল শিক্ষামূলক কন্টেন্ট পোর্টাল। পেশাদার শিক্ষকদের তৈরিকৃত মাল্টিমিডিয়া প্রেজেন্টেশন ও নোট কালেকশন।',
      website: 'https://www.teachers.gov.bd'
    },
    {
      id: 'ebk-mukto',
      name: 'মুক্তপাঠ (Muktopaath) ই-লার্নিং প্ল্যাটফর্ম',
      description: 'সরকারি ই-লার্নিং প্ল্যাটফর্ম যেখানে আইটি, পেডাগজি এবং নানাবিধ পেশাগত দক্ষতার চমৎকার ফ্রি ভিডিও কোর্স ও প্রামাণ্য নোট পাওয়া যায়।',
      website: 'https://www.muktopaath.gov.bd'
    },
    {
      id: 'ebk-kishor',
      name: 'কিশোর বাতায়ন (Konika)',
      description: 'মাধ্যমিক শিক্ষার্থীদের বিজ্ঞান, গণিত ও সাহিত্য চর্চার বিশেষ পোর্টাল। চমৎকার সায়েন্স প্রজেক্ট, বই এবং সৃজনশীল নোটের স্বর্গরাজ্য।',
      website: 'http://konika.gov.bd'
    },
    {
      id: 'ebk-10ms',
      name: '১০ মিনিট স্কুল ফ্রি একাডেমিক নোটস',
      description: 'নবম থেকে দ্বাদশ শ্রেণীর পদার্থ, রসায়ন, গণিত, ইংরেজি ও জীববিজ্ঞানের সকল হ্যান্ডনোট, সমাধান ও সাজেশন সম্পূর্ণ বিনামূল্যে পান।',
      website: 'https://10minuteschool.com'
    }
  ],
  'schools-colleges': [
    {
      id: 'sc-pngovt',
      name: 'পুঠিয়া পি.এন. সরকারি উচ্চ বিদ্যালয়',
      description: 'পুঠিয়া সদরের কেন্দ্রস্থলে অবস্থিত রাজশাহী জেলার অত্যন্ত গৌরবোজ্জ্বল ও প্রাচীনতম সরকারি মাধ্যমিক বালক ও বালিকা শিক্ষালয়।',
      phone: '01715263748',
      mapUrl: 'https://maps.google.com/?q=Puthia+PN+Govt+High+School',
      website: 'https://puthiapngovths.edu.bd'
    },
    {
      id: 'sc-baneshwar',
      name: 'বানেশ্বর সরকারি কলেজ, পুঠিয়া',
      description: 'পুঠিয়া উপজেলার এবং রাজশাহী বিভাগের ঐতিহ্যবাহী এক সুবিশাল বিদ্যাপীঠ, যা উচ্চমানের শিক্ষার জন্য সুবিদিত।',
      phone: '01712456789',
      mapUrl: 'https://maps.google.com/?q=Baneshwar+Govt+College',
      website: 'http://baneshwarcollege.edu.bd'
    },
    {
      id: 'sc-model',
      name: 'পুঠিয়া মডেল স্কুল অ্যান্ড কলেজ',
      description: 'পুঠিয়া উপজেলায় অত্যন্ত সুনামের সাথে দীর্ঘ সময় ধরে পরিচালিত এবং কৃতিত্ব অর্জনকারী অন্যতম বেসরকারি হাই স্কুল ও কলেজ।',
      phone: '01718877665',
      mapUrl: 'https://maps.google.com/?q=Puthia+Model+School+And+College'
    },
    {
      id: 'sc-bhalukgachi',
      name: 'ভালুকগাছি বহুমুখী উচ্চ বিদ্যালয়',
      description: 'ভালুকগাছি ইউনিয়নের শিক্ষার্থীদের দীর্ঘকাল ধরে সফলতার সাথে জ্ঞান দান করে আসা অন্যতম বৃহৎ উচ্চ বিদ্যালয়।',
      phone: '01733221144',
      mapUrl: 'https://maps.google.com/?q=Bhalukgachi+High+School'
    }
  ],
  'universities': [
    {
      id: 'uni-ru',
      name: 'রাজশাহী বিশ্ববিদ্যালয় (RU)',
      description: 'বাংলাদেশের অন্যতম বৃহত্তম ও দ্বিতীয় প্রাচীনতম পাবলিক রিসার্চ বিশ্ববিদ্যালয়। পুঠিয়া থেকে মাত্র ২০ কিলোমিটার পশ্চিমে অবস্থিত।',
      website: 'https://www.ru.ac.bd',
      phone: '0721-711101',
      mapUrl: 'https://maps.google.com/?q=University+of+Rajshahi'
    },
    {
      id: 'uni-ruet',
      name: 'রাজশাহী প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয় (RUET)',
      description: 'উত্তরবঙ্গের একমাত্র স্বনামধন্য ও শীর্ষস্থানীয় সরকারি কারিগরি ও প্রযুক্তি বিশ্ববিদ্যালয়। সেরা প্রকৌশলী গড়ার প্রতিষ্ঠান।',
      website: 'https://www.ruet.ac.bd',
      phone: '0721-750742',
      mapUrl: 'https://maps.google.com/?q=RUET'
    },
    {
      id: 'uni-rmu',
      name: 'রাজশাহী মেডিকেল বিশ্ববিদ্যালয় (RMU)',
      description: 'রাজশাহীর প্রধান সরকারি মেডিকেল গবেষণা বিশ্ববিদ্যালয়, যা দেশের সকল মেডিকেল ও নার্সিং কলেজের শিক্ষা নিয়ন্ত্রণ করে।',
      website: 'https://rmu.edu.bd',
      mapUrl: 'https://maps.google.com/?q=Rajshahi+Medical+University'
    },
    {
      id: 'uni-nu',
      name: 'জাতীয় বিশ্ববিদ্যালয় (National University)',
      description: 'সারাদেশের ডিগ্রি কলেজ, অনার্স ও মাস্টার্স কলেজের কেন্দ্রীয় পরীক্ষা নিয়ন্ত্রণ এবং ভর্তি ব্যবস্থাপনা পরিচালনাকারী বিশ্ববিদ্যালয়।',
      website: 'https://www.nu.ac.bd'
    }
  ],
  'ntrca-exam': [
    {
      id: 'ntr-apply',
      name: 'NTRCA অনলাইন আবেদন পোর্টাল',
      description: 'বেসরকারি শিক্ষক নিবন্ধন পরীক্ষার (প্রিলি, রিটেন, ভাইভা) আবেদনপত্র পূরণ, প্রিলিমিনারি টিকিট ডাউনলোড ও নোটিশ বোর্ড।',
      website: 'http://ntrca.teletalk.com.bd',
      phone: '121'
    },
    {
      id: 'ntr-recommend',
      name: 'শূন্য পদে শিক্ষক নিয়োগ সুপারিশ ও মেরিট লিস্ট (NGI)',
      description: 'নিবন্ধিত প্রার্থীদের জন্য সরকারি গণবিজ্ঞপ্তির শূন্যপদে অনলাইন চয়েস প্রদান এবং চূড়ান্ত নিয়োগ সুপারিশপত্র ডাউনলোডের কেন্দ্রীয় লিংক।',
      website: 'http://ngi.teletalk.com.bd',
      phone: '02-55045888'
    },
    {
      id: 'ntr-syllabus',
      name: 'শিক্ষক নিবন্ধন পরীক্ষার অফিশিয়াল সিলেবাস',
      description: 'স্কুল, কলেজ ও মাদ্রাসা পদের প্রিলিমিনারি ও লিখিত বিষয়ের সর্বশেষ হালনাগাদকৃত NTRCA পরীক্ষার পাঠ্যক্রম ও নম্বর বিভাজন।',
      website: 'http://www.ntrca.gov.bd',
      downloadUrl: 'http://www.ntrca.gov.bd/site/page/87e834bd-87c2-4dc9-983e-9080eb216ca8',
      isPdf: true
    }
  ],
  'exam-routine': [
    {
      id: 'rtn-ssc',
      name: 'SSC/Dakhil পরীক্ষার রুটিন (Rajshahi Board)',
      description: 'রাজশাহী শিক্ষা বোর্ডের এসএসসি ও মাদ্রাসার দাখিল পরীক্ষার হালনাগাদ রুটিন ও কেন্দ্র তালিকা নোটিশ পিডিএফ।',
      website: 'https://rajshahieducationboard.gov.bd',
      downloadUrl: 'https://rajshahieducationboard.gov.bd/notice',
      isPdf: true
    },
    {
      id: 'rtn-hsc',
      name: 'HSC/Alim পরীক্ষার রুটিন (Rajshahi Board)',
      description: 'রাজশাহী শিক্ষা বোর্ডের অধীনে অনুষ্ঠেয় একাদশ ও দ্বাদশ শ্রেণীর বার্ষিক ও বোর্ড ফাইনাল পরীক্ষার অফিসিয়াল রুটিন নোটিশ।',
      website: 'https://rajshahieducationboard.gov.bd',
      downloadUrl: 'https://rajshahieducationboard.gov.bd/notice',
      isPdf: true
    },
    {
      id: 'rtn-nu',
      name: 'জাতীয় বিশ্ববিদ্যালয় (NU) পরীক্ষার রুটিন',
      description: 'ডিগ্রি পাস, অনার্স এবং মাস্টার্স পরীক্ষার বিস্তারিত হালনাগাদ সময়সূচী, বিশেষ পরীক্ষার রুটিন এবং স্থগিত পরীক্ষার পরিবর্তিত সূচী।',
      website: 'https://www.nu.ac.bd/recent-news-notice.php',
      downloadUrl: 'https://www.nu.ac.bd/notice-board.php'
    }
  ],
  'notices': [
    {
      id: 'not-mopme',
      name: 'প্রাথমিক ও গণশিক্ষা মন্ত্রণালয় (MOPME)',
      description: 'সরকারি প্রাথমিক বিদ্যালয়ের ছুটির নোটিশ, উপবৃত্তি অনুমোদন, প্রাথমিক শিক্ষক নিয়োগ এবং বদলির অফিশিয়াল বিজ্ঞপ্তি ও সিদ্ধান্ত।',
      website: 'https://mopme.gov.bd',
      phone: '02-9512225'
    },
    {
      id: 'not-shed',
      name: 'মাধ্যমিক ও উচ্চ শিক্ষা বিভাগ (SHED)',
      description: 'শিক্ষা মন্ত্রণালয়ের অধীন স্কুল ও কলেজের ছুটি, পরীক্ষা গ্রহণ, পাঠ্যক্রম সংশোধন ও সরকারি স্কুল ভর্তি নির্দেশিকা নোটিশ।',
      website: 'https://shed.gov.bd',
      phone: '02-9511091'
    },
    {
      id: 'not-rajshahi',
      name: 'রাজশাহী শিক্ষা বোর্ডের সাম্প্রতিক নোটিশ বোর্ড',
      description: 'রাজশাহী শিক্ষা বোর্ডের অধীনে অনুষ্ঠিত সকল পরীক্ষা, কলেজ ভর্তি রেজিস্ট্রেশন ও বৃত্তির অফিশিয়াল নোটিশ ডাউনলোড বোর্ড।',
      website: 'https://rajshahieducationboard.gov.bd/notice',
      phone: '0721-772115',
      downloadUrl: 'https://rajshahieducationboard.gov.bd/notice',
      isPdf: true
    }
  ],
  'online-classes': [
    {
      id: 'cl-sangsad',
      name: 'আমার ঘরে আমার স্কুল (সংসদ টিভি আর্কাইভ)',
      description: 'সংসদ টেলিভিশনে প্রচারিত অভিজ্ঞ শিক্ষকদের মাধ্যমিক ক্লাসের ইউটিউব ভিডিও ও লেকচার সমাহার। বাসায় বসে প্রস্তুতি নেওয়ার চমৎকার মাধ্যম।',
      website: 'https://www.youtube.com/c/SangsadTV'
    },
    {
      id: 'cl-kishor',
      name: 'কিশোর বাতায়ন অনলাইন ক্লাস লাইব্রেরি',
      description: 'মাধ্যমিক স্তরের সকল শ্রেণীর বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক বিষয়ের অধ্যায়ভিত্তিক মানসম্মত ফ্রি ভিডিও ক্লাসের বৃহত্তম ডাটাবেস।',
      website: 'https://www.youtube.com/@KonikaBangladesh'
    },
    {
      id: 'cl-rajshahi',
      name: 'রাজশাহী বোর্ড ফ্রি অনলাইন ভিডিও ক্লাস',
      description: 'রাজশাহী শিক্ষা বোর্ডের নিজস্ব শিক্ষকদের দ্বারা ধারণকৃত ও প্রচারিত গণিত, পদার্থ ও আইসিটির ডিজিটাল ক্লাস রিসোর্স।',
      website: 'https://rajshahieducationboard.gov.bd'
    }
  ],
  'competitions': [
    {
      id: 'cmp-math',
      name: 'বাংলাদেশ গণিত অলিম্পিয়াড (BdMO)',
      description: 'জাতীয় গণিত অলিম্পিয়াডে অংশগ্রহণের আবেদন, পরীক্ষার নিয়মাবলী, সিলেবাস এবং বিগত বছরের অলিম্পিয়াডের প্রশ্ন ব্যাংক পিডিএফ।',
      website: 'https://matholympiad.org.bd',
      downloadUrl: 'https://matholympiad.org.bd/index.php/download'
    },
    {
      id: 'cmp-science',
      name: 'জাতীয় বিজ্ঞান ও প্রযুক্তি সপ্তাহ (মেলা নোটিশ)',
      description: 'পুঠিয়া উপজেলা ও রাজশাহী জেলা পর্যায়ে বিজ্ঞান মেলার তারিখ, ইভেন্ট ক্যাটাগরি, প্রজেক্ট প্রদর্শনী এবং কুইজ প্রতিযোগিতার তথ্য।',
      website: 'https://www.most.gov.bd'
    },
    {
      id: 'cmp-quiz',
      name: 'ভাষা অলিম্পিয়াড ও বঙ্গবন্ধু কুইজ',
      description: 'স্কুল-কলেজের শিক্ষার্থীদের জন্য বিভিন্ন মেধা অন্বেষণ প্রতিযোগিতা, রচনা লিখন, কুইজ ও বির্তক প্রতিযোগিতার প্রজ্ঞাপন ও আবেদন লিঙ্ক।',
      website: 'https://www.prothomalo.com'
    }
  ],
  'faq': [
    {
      id: 'faq-1',
      name: 'মোবাইল SMS এর মাধ্যমে SSC/HSC ফলাফল কীভাবে দেখব?',
      description: 'মোবাইলের মেসেজ অপশনে গিয়ে লিখুন: SSC <স্পেস> RAJ <স্পেস> Roll <স্পেস> Year এবং পাঠিয়ে দিন 16222 নম্বরে। যেমন: SSC RAJ 123456 2026 লিখে পাঠিয়ে দিন ১৬২২২ নম্বরে। ফিরতি মেসেজে জিপিএ এবং বিষয়ভিত্তিক গ্রেড জানিয়ে দেওয়া হবে।'
    },
    {
      id: 'faq-2',
      name: 'ডিজিটাল জন্ম নিবন্ধন কি ভর্তি আবেদন করার সময় বাধ্যতামূলক?',
      description: 'হ্যাঁ, বাংলাদেশ সরকারের নতুন নিয়মে প্রথম শ্রেণী থেকে নবম শ্রেণীতে যে কোনো সরকারি বা বেসরকারি সাধারণ ও ক্যাডেট স্কুলে ভর্তির আবেদন নিশ্চিত করতে ১৭ ডিজিটের অনলাইন ও ইংরেজি ডিজিটাল জন্ম নিবন্ধন সনদ থাকা বাধ্যতামূলক।'
    },
    {
      id: 'faq-3',
      name: 'উপবৃত্তির টাকা কখন এবং কীভাবে বিতরণ করা হয়?',
      description: 'উপবৃত্তির টাকা সাধারণত শিক্ষার্থীদের অভিভাবকদের নগদ বা রকেটের মত এমএফএস (Mobile Financial Services) মোবাইল ব্যাংকিং অ্যাকাউন্টে সরাসরি পাঠানো হয়। আবেদনের সময় সঠিক মোবাইল নম্বর ও এনআইডি প্রদান করা আবশ্যক।'
    },
    {
      id: 'faq-4',
      name: 'সার্টিফিকেটে বা মার্কশীটে নামের ভুল সংশোধন রাজশাহী শিক্ষা বোর্ডে কীভাবে করব?',
      description: 'ভুল সংশোধনের জন্য কোনো দালাল চক্র ছাড়া সরাসরি রাজশাহী শিক্ষা বোর্ডের অফিসিয়াল ওয়েবসাইটে অনলাইন সার্ভিস মেনুতে গিয়ে আবেদন করতে হবে। আবেদন ফি ব্যাংক ড্রাফটের মাধ্যমে প্রদান করা যায়। পরবর্তীতে শুনানি সম্পন্ন হলে সার্টিফিকেট রি-প্রিন্ট করা যাবে।'
    }
  ]
};

const EducationDetailView: React.FC = () => {
  const { subpage } = useParams<{ subpage: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('education_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const meta = useMemo(() => {
    return CATEGORY_META[subpage || ''] || {
      title: 'শিক্ষা সেকশন',
      subtitle: 'শিক্ষার্থী ও অভিভাবকদের জন্য তথ্য হাব',
      color: 'from-indigo-600 to-indigo-950',
      icon: <GraduationCap className="w-12 h-12 text-white" />
    };
  }, [subpage]);

  const items = useMemo(() => {
    return EDUCATION_DATABASE[subpage || ''] || [];
  }, [subpage]);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter(item => item !== id);
        toast.success('প্রিয় তালিকা থেকে সরানো হয়েছে');
      } else {
        updated = [...prev, id];
        toast.success('প্রিয় তালিকায় সংরক্ষণ করা হয়েছে');
      }
      localStorage.setItem('education_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const handleShare = async (item: EducationItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `${item.name}\n${item.description}\n${item.website ? `ওয়েবসাইট: ${item.website}` : ''}`,
        url: window.location.href
      }).catch(async () => {
        // Fallback copy if share fails
        await copyToClipboard(`${item.name} - ${item.website || ''}`);
        toast.success('তথ্য লিংক কপি করা হয়েছে');
      });
    } else {
      await copyToClipboard(`${item.name}\n${item.description}\n${item.website || ''}`);
      toast.success('তথ্য লিংক কপি করা হয়েছে');
    }
  };

  return (
    <ModulePageLayout
      title={meta.title}
      subtitle={meta.subtitle}
      loading={false}
      itemCount={filteredItems.length}
    >
      {/* Hero Banner matched to Puthia Portal Style */}
      <div className={`relative bg-gradient-to-br ${meta.color} rounded-[40px] p-8 md:p-14 text-white overflow-hidden mb-10 shadow-2xl shadow-indigo-900/10`}>
        {/* Decorative ambient spots */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/resources')}
              className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 cursor-pointer text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="text-white/80 text-xs font-black bg-white/15 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20">
              পুঠিয়া এডুকেশন হাব
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[24px] flex items-center justify-center border border-white/30 shadow-inner">
              {meta.icon}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">{meta.title}</h1>
              <p className="text-white/90 text-sm md:text-lg font-bold opacity-90 max-w-lg leading-relaxed">
                {meta.subtitle}
              </p>
            </div>
          </div>

          {/* Custom Search inside Hero */}
          <div className="max-w-2xl relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 w-6 h-6 group-focus-within:text-white transition-colors" />
            <input 
              type="text"
              placeholder="খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[28px] font-bold text-base text-white placeholder:text-white/40 outline-none focus:ring-4 focus:ring-white/10 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Main Items Listing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isFav = favorites.includes(item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-base font-black text-slate-800 leading-snug">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="p-2 hover:bg-slate-50 rounded-full transition-colors border-none bg-transparent cursor-pointer text-slate-400 hover:text-red-500 shrink-0"
                      >
                        <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </div>

                    <p className="text-slate-500 text-[12px] font-bold leading-relaxed mb-6">
                      {item.description}
                    </p>
                  </div>

                  {/* Operational Toolbar Buttons matching specs */}
                  <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100/60">
                    {item.website ? (
                      <button
                        onClick={() => window.open(item.website, '_blank')}
                        className="py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1.5 border-none cursor-pointer"
                      >
                        <Globe className="w-4 h-4" /> ওয়েবসাইট
                      </button>
                    ) : (
                      <button
                        disabled
                        className="py-3 bg-slate-50 text-slate-300 rounded-xl text-[10px] font-black flex flex-col items-center justify-center gap-1.5 border-none cursor-not-allowed opacity-50"
                      >
                        <Globe className="w-4 h-4" /> অফলাইন
                      </button>
                    )}

                    {item.mapUrl ? (
                      <button
                        onClick={() => window.open(item.mapUrl, '_blank')}
                        className="py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1.5 border-none cursor-pointer"
                      >
                        <MapPin className="w-4 h-4" /> ম্যাপ লোকেশন
                      </button>
                    ) : item.phone ? (
                      <button
                        onClick={() => {
                          window.location.href = `tel:${item.phone}`;
                          toast.info(`${item.phone} নম্বরে ডায়াল করা হচ্ছে`);
                        }}
                        className="py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1.5 border-none cursor-pointer"
                      >
                        <Phone className="w-4 h-4" /> সরাসরি কল
                      </button>
                    ) : (
                      <button
                        disabled
                        className="py-3 bg-slate-50 text-slate-300 rounded-xl text-[10px] font-black flex flex-col items-center justify-center gap-1.5 border-none cursor-not-allowed opacity-50"
                      >
                        <MapPin className="w-4 h-4" /> নো ম্যাপ
                      </button>
                    )}

                    {item.downloadUrl ? (
                      <button
                        onClick={() => window.open(item.downloadUrl, '_blank')}
                        className="py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1.5 border-none cursor-pointer animate-pulse"
                      >
                        <Download className="w-4 h-4" /> {item.isPdf ? 'PDF ডাউনলোড' : 'ডাউনলোড'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleShare(item)}
                        className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1.5 border-none cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" /> শেয়ার করুন
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-1 md:col-span-2 py-16 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-bold">কোনো তথ্য পাওয়া যায়নি। অন্য কিছু সার্চ করে দেখুন।</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {subpage === 'schools-colleges' && (
        <div className="mb-10 max-w-3xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/education')}
            className="w-full py-6 px-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[32px] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-blue-900/10 border-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-base font-black block">অনলাইন ডিরেক্টরি ভিজিট করুন</span>
                <span className="text-blue-100 text-[11px] font-bold opacity-80 block">পুঠিয়া উপজেলার সকল শিক্ষা প্রতিষ্ঠানের মূল সার্চ ডিরেক্টরি ও যোগাযোগ নম্বর</span>
              </div>
            </div>
            <span className="px-5 py-2.5 bg-white text-indigo-700 rounded-xl text-xs font-black shadow-md whitespace-nowrap">ডিরেক্টরি দেখুন →</span>
          </motion.button>
        </div>
      )}

      {/* Helpful Quick Tip / Advice banner */}
      <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-6 md:p-8 flex items-start gap-4 mb-10 max-w-3xl mx-auto">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
          <Award className="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <h4 className="text-sm font-black text-amber-900 mb-1">গুরুত্বপূর্ণ পরামর্শ</h4>
          <p className="text-amber-800 text-[11px] font-bold leading-relaxed">
            সরকারি ভর্তি ও পরীক্ষার রেজাল্ট প্রকাশের দিন ট্রাফিক অনেক বেশি থাকে। তাই সরকারি ডাউনলোডের সাইট খুলতে বিলম্ব হলে পেইজে কিছুক্ষণ অপেক্ষা করুন অথবা এসএমএস (SMS) পদ্ধতির সাহায্য নিন।
          </p>
        </div>
      </div>
    </ModulePageLayout>
  );
};

export default EducationDetailView;

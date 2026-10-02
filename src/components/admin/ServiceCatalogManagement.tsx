import React, { useState, useEffect } from 'react';
import { 
  collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, setDoc, getDocs 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Plus, Edit3, Trash2, Check, X, Search, Filter, 
  ArrowUpDown, Eye, EyeOff, Link as LinkIcon, ExternalLink, RefreshCw, 
  FileText, Shield, Layers, Hash, CheckCircle2, AlertCircle, MoveUp, MoveDown, 
  Building2, HeartPulse, GraduationCap, Sprout, Landmark, ShieldAlert, Bus, HelpCircle,
  FileCheck, Globe, Clock, Phone, AlertTriangle, ChevronRight, Grid,
  Inbox, FileEdit, UserCheck, ThumbsUp, ThumbsDown, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import ServicesGridManagement from './ServicesGridManagement';
import { 
  upazilaServicesService, 
  UpazilaServiceSubmission, 
  UpazilaServiceEditRequest, 
  UpazilaServiceReport 
} from '../../services/upazilaServicesService';

export interface UpazilaServiceItem {
  id: string;
  order: number;
  title: string;
  titleEn?: string;
  category: string;
  icon: string;
  subtitle: string;
  description: string;
  processingTime: string;
  fee: string;
  requiredDocuments: string[];
  helpline: string;
  department: string;
  isActive: boolean;
  connectionType: 'internal' | 'external' | 'form';
  connectedPageUrl: string;
  connectedPageName: string;
  updatedAt?: any;
  updatedBy?: string;
}

// 9 Categories for 63 Services
export const SERVICE_CATEGORIES = [
  { id: 'health', name: 'স্বাস্থ্য ও চিকিৎসা সেবা', icon: '🩺', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'education', name: 'শিক্ষা, ট্রেনিং ও বৃত্তি', icon: '🎓', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'land', name: 'ভূমি, নামজারি ও রেজিস্ট্রি', icon: '📜', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'civil_reg', name: 'এনআইডি, জন্ম নিবন্ধন ও পাসপোর্ট', icon: '🆔', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'agri', name: 'কৃষি, মৎস্য ও প্রাণিসম্পদ', icon: '🌾', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'upazila_gov', name: 'উপজেলা প্রশাসন ও ইউপি সেবা', icon: '🏛️', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'social', name: 'সামাজিক নিরাপত্তা ও সরকারি ভাতা', icon: '🛡️', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'emergency_legal', name: 'আইন, বিচার, ফায়ার ও পুলিশ', icon: '⚖️', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'utility_biz', name: 'বিদ্যুৎ, ব্যাংক, ই-সেবা ও ব্যবসা', icon: '⚡', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
];

// Pre-populated 63 Upazila Civic Services Seed Dataset
export const SEED_63_SERVICES: Omit<UpazilaServiceItem, 'id'>[] = [
  // 1-8: Health
  { order: 1, title: 'উপজেলা স্বাস্থ্য কমপ্লেক্স আউটডোর ও জরুরি সেবা', category: 'health', icon: '🩺', subtitle: '২৪/৭ প্রাথমিক ও জরুরি চিকিৎসা সেবা', description: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্সে সার্বক্ষণিক জরুরি চিকিৎসা সেবা ও টিকিট কাটার মাধ্যমে আউটডোর রোগী দেখা হয়।', processingTime: 'ইনস্ট্যান্ট / ৩০ মিনিট', fee: 'বিনামূল্যে (টিকিট ১০ টাকা)', requiredDocuments: ['এনআইডি/মোবাইল নম্বর'], helpline: '01713000000', department: 'উপজেলা স্বাস্থ্য ও পরিবার পরিকল্পনা অফিস', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/health', connectedPageName: 'হাসপাতাল ও স্বাস্থ্য সেবা' },
  { order: 2, title: 'কমিউনিটি ক্লিনিক প্রাথমিক চিকিৎসা ও বিনামূল্যে ওষুধ', category: 'health', icon: '🏥', subtitle: 'গ্রামাঞ্চলে মা ও শিশু স্বাস্থ্য এবং ২৭ প্রকারের ফ্রি ওষুধ', description: 'ইউনিয়ন পর্যায়ের ৩টি করে ওয়ার্ডে গঠিত ক্লিনিক থেকে প্রাথমিক স্বাস্থ্যসেবা প্রদান।', processingTime: 'ইনস্ট্যান্ট', fee: 'সম্পূর্ণ বিনামূল্যে', requiredDocuments: ['উপজেলা নাগরিকত্ব প্রমাণ'], helpline: '16263', department: 'স্বাস্থ্য অধিদপ্তর', isActive: true, connectionType: 'internal', connectedPageUrl: '/community-clinics', connectedPageName: 'কমিউনিটি ক্লিনিক নির্দেশিকা' },
  { order: 3, title: 'জরুরি অ্যাম্বুলেন্স কলিং সার্ভিস', category: 'health', icon: '🚑', subtitle: 'উপজেলা স্বাস্থ্য কমপ্লেক্স ও বেসরকারি অ্যাম্বুলেন্স কল ব্যবস্থা', description: 'জরুরি রোগী স্থানান্তরের জন্য পুঠিয়া সদর থেকে রাজশাহী বা ঢাকা রুটে অ্যাম্বুলেন্স বুকিং।', processingTime: '১০-১৫ মিনিট', fee: 'সরকারি নির্ধারিত দর/কিলোমিটার', requiredDocuments: ['রোগীর নাম ও গন্তব্য'], helpline: '01700000001', department: 'উপজেলা অ্যাম্বুলেন্স সার্ভিস', isActive: true, connectionType: 'internal', connectedPageUrl: '/ambulances', connectedPageName: 'অ্যাম্বুলেন্স কল হাব' },
  { order: 4, title: 'জরুরি রক্তের গ্রুপিং ও ব্লাড ডোনার সন্ধান', category: 'health', icon: '🩸', subtitle: 'উপজেলার নিবন্ধিত রক্তদাতাদের ডিরেক্টরি ও জরুরি রিকুয়েস্ট', description: 'যেকোনো গ্রুপের জরুরি রক্তের জন্য স্বেচ্ছাসেবী রক্তদাতাদের সরাসরি মোবাইল নম্বর।', processingTime: 'ইনস্ট্যান্ট সার্চ', fee: 'বিনামূল্যে (স্বেচ্ছায় রক্তদান)', requiredDocuments: ['রোগীর ব্লাড গ্রুপ ও হাসপাতাল রিকুইজিশন'], helpline: '01700000002', department: 'পুঠিয়া ব্লাড ব্যাংক নেটওয়ার্ক', isActive: true, connectionType: 'internal', connectedPageUrl: '/blood-donors', connectedPageName: 'রক্তদাতা অনুসন্ধান পেজ' },
  { order: 5, title: 'গর্ভবতী মা ও শিশু নিয়মিত টিকাদান (EPI)', category: 'health', icon: '💉', subtitle: 'বিসিজি, পেন্টা, পোলিও ও গর্ভবতী টিটি টিকা ক্যাম্পেইন', description: 'উপজেলার সকল ওয়ার্ডভিত্তিক ইপিআই কেন্দ্রে শিশুদের নিয়মিত টিকা প্রদান।', processingTime: 'ক্যাম্পেইন ডে অনুযায়ী', fee: 'বিনামূল্যে', requiredDocuments: ['ইপিআই কার্ড / শিশু জন্ম কার্ড'], helpline: '16263', department: 'উপজেলা ইপিআই টিকাদান বিভাগ', isActive: true, connectionType: 'internal', connectedPageUrl: '/vaccination', connectedPageName: 'টিকাদান কেন্দ্র শিডিউল' },
  { order: 6, title: 'অভিজ্ঞ বিশেষজ্ঞ ডাক্তার চেম্বার ও সিরিয়াল বুকিং', category: 'health', icon: '👨‍⚕️', subtitle: 'মেডিসিন, গাইনি, শিশু ও চর্ম বিশেষজ্ঞ সার্ভিস', description: 'পুঠিয়া ও রাজশাহী শহরের বিশেষজ্ঞ চিকিৎসকদের ডিগ্রি, চেম্বার ঠিকানা ও ফোন।', processingTime: 'অনলাইন সিরিয়াল', fee: 'ডাক্তারের কনসালটেন্সি ফি', requiredDocuments: ['রোগীর পরিচিতি'], helpline: '01700000003', department: 'উপজেলা ডক্টরস হাব', isActive: true, connectionType: 'internal', connectedPageUrl: '/doctors', connectedPageName: 'ডাক্তার নির্দেশিকা ও বুকিং' },
  { order: 7, title: 'উপজেলা পরিবার পরিকল্পনা ও মাতৃত্বকালীন পরামর্শ', category: 'health', icon: '🤱', subtitle: 'মা ও শিশু কল্যাণ এবং ফ্যামিলি প্ল্যানিং সামগ্রী বিতরণ', description: 'পরিবার পরিকল্পনা সামগ্রী ও স্বাস্থ্য কর্মী পরামর্শ সরাসরি বাড়িতে ও স্বাস্থ্যকেন্দ্রে।', processingTime: 'তাত্ক্ষণিক', fee: 'বিনামূল্যে', requiredDocuments: ['দম্পতি পরিচিতি'], helpline: '01700000004', department: 'উপজেলা পরিবার পরিকল্পনা অফিস', isActive: true, connectionType: 'internal', connectedPageUrl: '/family-planning', connectedPageName: 'পরিবার পরিকল্পনা পেজ' },
  { order: 8, title: 'ডায়াগনস্টিক সেন্টার ও প্যাথলজি পরীক্ষা তথ্য', category: 'health', icon: '🔬', subtitle: 'রক্ত পরীক্ষা, এক্স-রে ও আল্ট্রাসোনোগ্রাফি রিপোর্ট হাব', description: 'অনুমোদিত সকল বেসরকারি প্যাথলজি ল্যাব ও টেস্টের রেটচার্ট।', processingTime: '২-২৪ ঘণ্টা', fee: 'ল্যাব নির্ধারিত মূল্য', requiredDocuments: ['ডাক্তারের প্রেসক্রিপশন'], helpline: '01700000005', department: 'উপজেলা প্রাইভেট ল্যাব এসোসিয়েশন', isActive: true, connectionType: 'internal', connectedPageUrl: '/diagnostics', connectedPageName: 'ডায়াগনস্টিক ল্যাব লিস্ট' },

  // 9-16: Land & Property
  { order: 9, title: 'ই-নামজারি (Mutation) ও খতিয়ান হালনাগাদ আবেদন', category: 'land', icon: '📜', subtitle: 'অনলাইনে জমির নামজারি ও জমাভাগ আবেদন', description: 'অনলাইনে ই-নামজারি আবেদন জমা দেওয়া এবং সহকারী কমিশনার (ভূমি) অফিস থেকে অনুমোদিত খতিয়ান প্রাপ্তি।', processingTime: '২৮ কর্মদিবস', fee: '১,১৭০ টাকা (অনলাইন ফি)', requiredDocuments: ['দলিল/পিঠ দলিল', 'খতিয়ান কপি', 'খাজনা রশিদ', 'এনআইডি'], helpline: '16122', department: 'উপজেলা ভূমি অফিস, পুঠিয়া', isActive: true, connectionType: 'external', connectedPageUrl: 'https://mutation.land.gov.bd', connectedPageName: 'ই-নামজারি অফিসিয়াল পোর্টাল' },
  { order: 10, title: 'অনলাইন ভূমি উন্নয়ন কর (খাজনা) প্রদান', category: 'land', icon: 'প', subtitle: 'স্মার্ট উপায়ে ঘরে বসে ডিজিটাল জমির খাজনা পরিশোধ', description: 'অনলাইনে বিকাশ/নগদে জমির খাজনা দেওয়া এবং ই-দাখিলা ডাউনলোড।', processingTime: '১০ মিনিট', fee: 'হাল সনের হার অনুযায়ী', requiredDocuments: ['হোল্ডিং নম্বর', 'খতিয়ান ও দাগ নম্বর'], helpline: '16122', department: 'ইউনিয়ন ভূমি অফিস', isActive: true, connectionType: 'external', connectedPageUrl: 'https://ldtax.gov.bd', connectedPageName: 'ভূমি উন্নয়ন কর পোর্টাল' },
  { order: 11, title: 'ডিজিটাল ই-পর্চা (Khatian) সাশ্রয়ী অনুলিপি সংগ্রহ', category: 'land', icon: '🗺️', subtitle: 'সিএস, এসএ, আরএস ও বিএস খতিয়ান ডিজিটাল কপি', description: 'অনলাইনে সার্টিফাইড বা সাধারণ ই-পর্চা আবেদন ও ডাকযোগে ঘরে বসে সার্টিফিকেট প্রাপ্তি।', processingTime: '৩-৭ দিন', fee: '১০০ টাকা + ডাক মাশুল', requiredDocuments: ['মৌজা, দাগ ও খতিয়ান নম্বর'], helpline: '16122', department: 'জেলা রেকর্ড রুম ও ভূমি জরিপ', isActive: true, connectionType: 'external', connectedPageUrl: 'https://eporcha.gov.bd', connectedPageName: 'ই-পর্চা পোর্টাল' },
  { order: 12, title: 'উপজেলা সাব-রেজিস্ট্রি অফিস জমি রেজিস্ট্রি তথ্য', category: 'land', icon: '🏛️', subtitle: 'দলিল সম্পাদন, সাব-কবলা, হেবা ও বায়াপত্র রেজিস্ট্রি', description: 'জমির রেজিস্ট্রি ফি হিসাব, স্ট্যাম্প শুল্ক ও দলিল লেখকের ফি সম্পর্কিত পূর্ণাঙ্গ নির্দেশিকা।', processingTime: '১ দিন', fee: 'দলিলের মূল্যের ৮-১০%', requiredDocuments: ['নামজারি খতিয়ান', 'হাল খাজনা', 'ওয়ারিশ সনদ/দলিল'], helpline: '01700000006', department: 'উপজেলা সাব-রেজিস্ট্রারের কার্যালয়', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/land-registry', connectedPageName: 'জমি রেজিস্ট্রি ক্যালকুলেটর' },
  { order: 13, title: 'অর্পিত ও খাস জমি লিজ/বন্দোবস্ত নিয়মাবলী', category: 'land', icon: '🏞️', subtitle: 'কৃষি খাস জমি ভূমিহীন পরিবারকে বন্দোবস্ত প্রদান', description: 'উপজেলা খাস জমি বন্টন কমিটির মাধ্যমে ভূমিহীনদের খাস জমি ও দিঘী লীজ পাওয়ার ফরম।', processingTime: 'বিভাগীয় প্রক্রিয়া', fee: 'বিনামূল্যে ফরম', requiredDocuments: ['ভূমিহীন সনদপত্র', 'নাগরিকত্ব এনআইডি'], helpline: '01700000007', department: 'সহকারী কমিশনার (ভূমি) অফিস', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/khas-land', connectedPageName: 'খাস জমি লিজ তথ্য' },
  { order: 14, title: 'মৌজা ম্যাপ (CS/RS/BS Map) অনলাইন আবেদন', category: 'land', icon: '🗺️', subtitle: 'নকশা ও প্লাস্টার ম্যাপ অনুলিপি সংগ্রহ', description: 'অনলাইনে মৌজা ম্যাপের সার্টিফাইড কপি আবেদন ও দাগ সীমানা চিহ্নিতকরণ।', processingTime: '৭-১০ দিন', fee: '৫২০ টাকা', requiredDocuments: ['মৌজা নাম ও জেএল নম্বর'], helpline: '16122', department: 'ভূমি রেকর্ড ও জরিপ অধিদপ্তর', isActive: true, connectionType: 'external', connectedPageUrl: 'https://eporcha.gov.bd', connectedPageName: 'মৌজা ম্যাপ আবেদন' },
  { order: 15, title: 'জমির সীমানা নির্ধারণ ও সরকারি সার্ভেয়ার আমিন আবেদন', category: 'land', icon: '📐', subtitle: 'জমি মাপা ও সীমানা বিরোধ নিস্পত্তি সার্ভিস', description: 'উপজেলা ভূমি অফিসের অনুমোদিত সরকারি আমিন দ্বারা জমি মেপে সীমানা খুঁটি স্থাপন।', processingTime: '১৫ দিন', fee: 'সরকারি চালান ফি', requiredDocuments: ['মালিকানা দলিল ও খতিয়ান'], helpline: '01700000008', department: 'এসিল্যান্ড অফিস সার্ভে শাখা', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/land-survey', connectedPageName: 'আমিন আবেদন পেজ' },
  { order: 16, title: 'জমি সংক্রান্ত বিরোধ ও মিস কেস (Miss Case) আপিল', category: 'land', icon: '⚖️', subtitle: 'সহকারী কমিশনার (ভূমি) আদালতে মিস কেস দায়ের', description: 'ভুল নামজারি বাতিল বা খতিয়ান সংশোধনের জন্য এসিল্যান্ড আদালতে শুনানির দরখাস্ত।', processingTime: '৩০-৬০ দিন', fee: 'শুনানি কোর্ট ফি', requiredDocuments: ['আরজি কপি ও প্রমান্য দলিল'], helpline: '01700000009', department: 'সহকারী কমিশনার (ভূমি) আদালত', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/land-appeal', connectedPageName: 'এসিল্যান্ড আদালত গাইড' },

  // 17-24: Civil Registration, NID & Passport
  { order: 17, title: 'অনলাইন জন্ম ও মৃত্যু নিবন্ধন (Birth & Death Certificate)', category: 'civil_reg', icon: '👶', subtitle: 'নতুন জন্ম সনদ ও অনলাইন সংশোধন আবেদন', description: 'ইউনিয়ন পরিষদ বা পৌরসভা থেকে ডিজিটাল জন্ম সনদ তৈরি ও ইংরেজি ভার্সন সংশোধন।', processingTime: '৩-৭ দিন', fee: '৫০ - ১০০ টাকা (বয়সভেদে)', requiredDocuments: ['হাসপাতাল ছাড়পত্র/টিকা কার্ড', 'বাবা-মায়ের এনআইডি'], helpline: '01700000010', department: 'ইউপি/পৌরসভা জন্ম নিবন্ধন শাখা', isActive: true, connectionType: 'external', connectedPageUrl: 'https://bdris.gov.bd', connectedPageName: 'বিডিআরআইএস জন্ম পোর্টাল' },
  { order: 18, title: 'জাতীয় পরিচয়পত্র (NID) নতুন ভোটার ও তথ্য সংশোধন', category: 'civil_reg', icon: '🆔', subtitle: 'স্মার্ট এনআইডি কার্ড রিইস্যু ও ভুল নাম/ঠিকানা সংশোধন', description: 'উপজেলা নির্বাচন অফিসে নতুন ভোটার হওয়া এবং ছবি/স্বাক্ষর/পাসওয়ার্ড সংশোধন আবেদন।', processingTime: '১৫-৩০ দিন', fee: '২৩০ - ৩৪৫ টাকা (চালান)', requiredDocuments: ['এসএসসি সনদ/জন্ম সনদ', 'নাগরিকত্ব সনদ', 'বিদ্যুৎ বিল'], helpline: '105', department: 'উপজেলা নির্বাচন অফিস, পুঠিয়া', isActive: true, connectionType: 'external', connectedPageUrl: 'https://services.nidw.gov.bd', connectedPageName: 'এনআইডি উইং পোর্টাল' },
  { order: 19, title: 'ই-পাসপোর্ট (e-Passport) অনলাইন আবেদন ও ফি জমা', category: 'civil_reg', icon: '🛂', subtitle: '১০ বছর মেয়াদী ই-পাসপোর্ট আবেদন ও পুলিশ ভেরিফিকেশন গাইড', description: 'অনলাইনে ফরম পূরণ, চালান ফি জমা দেওয়া ও ফিঙ্গারপ্রিন্টের জন্য অ্যাইস্টারমেন্ট নেওয়া।', processingTime: '৭ - ২১ দিন', fee: '৪,০২৫ - ৮,০৫০ টাকা', requiredDocuments: ['এনআইডি/জন্ম সনদ', 'পূর্বের পাসপোর্ট (যদি থাকে)'], helpline: '16445', department: 'আঞ্চলিক পাসপোর্ট অফিস, রাজশাহী', isActive: true, connectionType: 'external', connectedPageUrl: 'https://epassport.gov.bd', connectedPageName: 'ই-পাসপোর্ট পোর্টাল' },
  { order: 20, title: 'নাগরিকত্ব, চারিত্রিক ও ওয়ারিশান সনদপত্র', category: 'civil_reg', icon: '📜', subtitle: 'ইউপি চেয়ারম্যান ও মেয়র স্বাক্ষরিত ই-সনদ প্রাপ্তি', description: 'অনলাইনে বা ইউপি ডিজিটাল সেন্টার থেকে ওয়ারিশ সনদ ও চারিত্রিক সনদ সংগ্রহ।', processingTime: '১-২ দিন', fee: '৫০ - ২০০ টাকা', requiredDocuments: ['অনলাইন জন্ম সনদ', 'এনআইডি কপি'], helpline: '01700000011', department: 'সংশ্লিষ্ট ইউনিয়ন পরিষদ / পৌরসভা', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/heritage-certificate', connectedPageName: 'ইউপি ওয়ারিশ সনদ আবেদন' },
  { order: 21, title: 'ভোটার এলাকা স্থানান্তর ও এনআইডি ঠিকানা পরিবর্তন', category: 'civil_reg', icon: '🏠', subtitle: 'অন্য উপজেলা থেকে পুঠিয়ায় ভোটার স্থানান্তর', description: 'স্থায়ী বা বর্তমান ঠিকানায় ভোটার এলাকা পরিবর্তনের ফরম-১৩ জমা দেওয়া।', processingTime: '২০-৩০ দিন', fee: 'বিনামূল্যে', requiredDocuments: ['ইউপি চেয়ারম্যানের প্রত্যয়ন', 'বাড়ি ভাড়ার রশিদ/হোল্ডিং টেপ'], helpline: '105', department: 'উপজেলা নির্বাচন কর্মকর্তা', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/voter-transfer', connectedPageName: 'ভোটার স্থানান্তর নির্দেশিকা' },
  { order: 22, title: 'হারিয়ে যাওয়া এনআইডি ও জন্ম সনদ রিইস্যু জিডি নির্দেশিকা', category: 'civil_reg', icon: '🔍', subtitle: 'থানায় অনলাইন জিডি ও ডুপ্লিকেট সনদ সংগ্রহ', description: 'কার্ড হারিয়ে গেলে পুঠিয়া থানায় অনলাইন জিডি নম্বর দিয়ে নতুন কার্ডের আবেদন।', processingTime: '৩-৫ দিন', fee: 'সরকারি চালান ফি', requiredDocuments: ['থানার জিডি কপি', 'ট্রেজারি চালান'], helpline: '105', department: 'উপজেলা নির্বাচন অফিস ও থানা', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/lost-nid-gd', connectedPageName: 'জিডি ও কার্ড রিইস্যু গাইড' },
  { order: 23, title: 'বিদেশগামী কর্মীদের বিএমইটি (BMET) অনলাইন রেজিস্ট্রেশন', category: 'civil_reg', icon: '✈️', subtitle: 'আমি প্রবাসী অ্যাপের মাধ্যমে ফিঙ্গারপ্রিন্ট ও স্মার্টকার্ড', description: 'বৈদেশিক কর্মসংস্থান ও জনশক্তি ব্যুরোর ডেটাবেজে নাম নিবন্ধন ও ওরিয়েন্টেশন প্রশিক্ষণ।', processingTime: '১-২ দিন', fee: '৩০০ টাকা', requiredDocuments: ['পাসপোর্ট কপি', 'ভিসা/অফার লেটার'], helpline: '16135', department: 'জেলা কর্মসংস্থান ও জনশক্তি অফিস', isActive: true, connectionType: 'external', connectedPageUrl: 'https://bmet.gov.bd', connectedPageName: 'BMET স্মার্ট কার্ড পোর্টাল' },
  { order: 24, title: 'বিবাহ ও তালাক রেজিস্ট্রেশন (কাজী অফিস তথ্য)', category: 'civil_reg', icon: '💍', subtitle: 'অনুমোদিত নিকাহ রেজিস্টার ও কাবিননামা সার্টিফাইড কপি', description: 'উপজেলার সকল ইউনিয়নের সরকারি নিকাহ রেজিস্টারদের ঠিকানা ও কাবিননামা উত্তোলন।', processingTime: '১ দিন', fee: 'দেনমোহরের অনুপাতে সরকারি রেট', requiredDocuments: ['বর-কনের এনআইডি/জন্মসনদ', 'ছবি'], helpline: '01700000012', department: 'উপজেলা কাজী এসোসিয়েশন', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/kazi-office', connectedPageName: 'উপজেলা কাজী অফিস লিস্ট' },

  // 25-32: Education & Training
  { order: 25, title: 'উপজেলা প্রাথমিক ও মাধ্যমিক শিক্ষা বৃত্তি আবেদন', category: 'education', icon: '🎓', subtitle: 'উপবৃত্তি (Stipend) অনলাইন রেজিস্টার ও বিকাশ অ্যাকাউন্ট', description: 'প্রাথমিক ও মাধ্যমিক শিক্ষার্থীদের সরকারি উপবৃত্তি তালিকায় নাম ভুক্তি ও পেমেন্ট মনিটরিং।', processingTime: 'শিক্ষাবর্ষের শুরুতে', fee: 'সম্পূর্ণ বিনামূল্যে', requiredDocuments: ['শিক্ষার্থীর জন্ম সনদ', 'অভিভাবকের এনআইডি ও নগদ/বিকাশ'], helpline: '01700000013', department: 'উপজেলা শিক্ষা অফিস (প্রাথমিক ও মাধ্যমিক)', isActive: true, connectionType: 'internal', connectedPageUrl: '/education/stipend', connectedPageName: 'উপবৃত্তি আবেদন তথ্য' },
  { order: 26, title: 'এসএসসি ও এইচএসসি নম্বরপত্র/সনদপত্র তোলা ও বোর্ড সংশোধন', category: 'education', icon: '📜', subtitle: 'রাজশাহী শিক্ষা বোর্ড থেকে মূল সনদ ও মার্কশিট সংশোধন', description: 'পরীক্ষার নম্বরপত্র হারিয়ে গেলে বা নাম ভুল হলে রাজশাহী বোর্ডে অনলাইন দরখাস্ত।', processingTime: '৭-১৫ দিন', fee: 'বোর্ড নির্ধারিত ফি', requiredDocuments: ['প্রবেশপত্র', 'রেজিস্ট্রেশন কার্ড', 'জিডি কপি'], helpline: '02588800000', department: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, রাজশাহী', isActive: true, connectionType: 'external', connectedPageUrl: 'https://rajshahieducationboard.gov.bd', connectedPageName: 'রাজশাহী বোর্ড সার্ভিস' },
  { order: 27, title: 'উপজেলা যুব উন্নয়ন অধিদপ্তর ফ্রি কম্পিউটার ও কারিগরি প্রশিক্ষণ', category: 'education', icon: '💻', subtitle: 'কম্পিউটার, ইলেকট্রিক্যাল, সেলাই ও ড্রেস মেকিং কোর্স', description: '১ থেকে ৬ মাস মেয়াদী বিনামূল্যে কারিগরি প্রশিক্ষণ ও কোর্স শেষে সরকারি সার্টিফিকেট প্রদান।', processingTime: 'সেশন ভিত্তিক', fee: 'বিনামূল্যে / সামান্য ভর্তি ফি', requiredDocuments: ['ন্যূনতম ৮ম শ্রেণী/এসএসসি পাস সনদ', 'এনআইডি'], helpline: '01700000014', department: 'উপজেলা যুব উন্নয়ন কর্মকর্তার কার্যালয়', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/youth-training', connectedPageName: 'যুব উন্নয়ন ট্রেনিং ভর্তি' },
  { order: 28, title: 'সরকারি কারিগরি ও পলিটেকনিক ইনস্টিটিউট ভর্তি তথ্য', category: 'education', icon: '🏫', subtitle: 'ডিপ্লোমা-ইন-ইঞ্জিনিয়ারিং ভর্তি আবেদন হাব', description: 'সরকারি পলিটেকনিক ও টেকনিক্যাল স্কুল এন্ড কলেজে অনলাইন ভর্তি নির্দেশিকা।', processingTime: 'ভর্তি সার্কুলার অনুযায়ী', fee: '৩০০ টাকা (আবেদন ফি)', requiredDocuments: ['এসএসসি রোল ও রেজিস্ট্রেশন'], helpline: '01700000015', department: 'বাংলাদেশ কারিগরি শিক্ষা বোর্ড', isActive: true, connectionType: 'external', connectedPageUrl: 'http://btebadmission.gov.bd', connectedPageName: 'কারিগরি ভর্তি পোর্টাল' },
  { order: 29, title: 'প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট অনগ্রসর শিক্ষার্থী অনুদান', category: 'education', icon: '🤝', subtitle: 'দরিদ্র ও মেধাবী শিক্ষার্থীদের এককালীন অর্থ সাহায্য', description: 'স্কুল, কলেজ ও বিশ্ববিদ্যালয় শিক্ষার্থীদের অনলাইন সফটওয়্যারের মাধ্যমে অনুদান প্রদান।', processingTime: 'বার্ষিক সার্কুলার', fee: 'বিনামূল্যে আবেদন', requiredDocuments: ['শিক্ষা প্রতিষ্ঠানের প্রধানের সুপারিশ', 'আয়ের প্রত্যয়ন'], helpline: '02-55006000', department: 'প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট', isActive: true, connectionType: 'external', connectedPageUrl: 'http://www.pmedu.gov.bd', connectedPageName: 'শিক্ষা সহায়তা ট্রাস্ট' },
  { order: 30, title: 'পাবলিক লাইব্রেরি ও উপজেলা পাঠাগার মেম্বারশিপ', category: 'education', icon: '📚', subtitle: 'বিনামূল্যে বই পড়া ও চাকরির পরীক্ষার প্রস্তুতি কেন্দ্র', description: 'উপজেলা গণগ্রন্থাগারে সদস্য হয়ে আন্তর্জাতিক ও দেশীয় বই এবং দৈনিক পত্রিকা পড়ার সুযোগ।', processingTime: 'ইনস্ট্যান্ট মেম্বারশিপ', fee: '৫০ টাকা মেম্বারশিপ ফি', requiredDocuments: ['এনআইডি/ছাত্রত্ব কার্ড', '১ কপি ছবি'], helpline: '01700000016', department: 'উপজেলা গণগ্রন্থাগার, পুঠিয়া', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/library', connectedPageName: 'লাইব্রেরি বুক ক্যাটালগ' },
  { order: 31, title: 'স্কুল-কলেজ উপবৃত্তি ও ভর্তি উপবৃত্তি পোর্টাল', category: 'education', icon: '🎒', subtitle: '৬ষ্ঠ থেকে দ্বাদশ শ্রেণী পর্যন্ত উপবৃত্তি সার্ভিস', description: 'অনগ্রসর এলাকার শিক্ষার্থীদের জন্য সমন্বিত উপবৃত্তি কর্মসূচির তালিকা।', processingTime: 'অনলাইন এন্ট্রি', fee: 'বিনামূল্যে', requiredDocuments: ['শিক্ষার্থীর প্রোফাইল ডাটা'], helpline: '01700000017', department: 'উপজেলা মাধ্যমিক শিক্ষা শাখা', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/stipend-portal', connectedPageName: 'উপবৃত্তি পেমেন্ট স্ট্যাটাস' },
  { order: 32, title: 'মুক্তপাঠ (Muktopaath) ই-লার্নিং ও দক্ষতা সার্টিফিকেট', category: 'education', icon: '🌐', subtitle: 'অনলাইনে সরকারি সনদসহ ফ্রী স্কিল ডেভেলপমেন্ট কোর্স', description: 'কম্পিউটার, শিক্ষক প্রশিক্ষণ, ফ্রিল্যান্সিং ও ক্ষুদ্র ব্যবসার সরকারি অনলাইন লার্নিং।', processingTime: 'স্বসংক্রান্ত সময়', fee: 'বিনামূল্যে', requiredDocuments: ['জিমেইল ও মোবাইল'], helpline: '09638000000', department: 'a2i অ্যাসপায়ার টু ইনোভেশন', isActive: true, connectionType: 'external', connectedPageUrl: 'https://muktopaath.gov.bd', connectedPageName: 'মুক্তপাঠ ই-লার্নিং' },

  // 33-40: Agriculture, Livestock & Fisheries
  { order: 33, title: 'উপজেলা কৃষি অফিস সার, বীজ ও কৃষি প্রণোদনা সহায়তা', category: 'agri', icon: '🌾', subtitle: 'বিনামূল্যে উন্নত জাতের ধান, গম, সরিষা ও পেঁয়াজ বীজ বিতরণ', description: 'ক্ষুদ্র ও প্রান্তিক কৃষকদের মাঝে সরকারি কৃষি প্রণোদনার সার ও বীজ বরাদ্দ প্রদান।', processingTime: 'মৌসুমী প্রণোদনা অনুযায়ী', fee: 'সম্পূর্ণ বিনামূল্যে', requiredDocuments: ['কৃষক কার্ড (Krishi Card)', 'এনআইডি'], helpline: '01700000018', department: 'উপজেলা কৃষি সম্প্রসারণ অফিস, পুঠিয়া', isActive: true, connectionType: 'internal', connectedPageUrl: '/agri', connectedPageName: 'কৃষি সেবা ও সার মূল্য' },
  { order: 34, title: 'উপজেলা প্রাণিসম্পদ হাসপাতাল পশুপাখি চিকিৎসা ও ভ্যাকসিন', category: 'agri', icon: '🐄', subtitle: 'গরু, ছাগল, হাঁস-মুরগির ফ্রী চিকিৎসা ও কৃত্রিম প্রজনন (AI)', description: 'তড়কা, খুরা রোগ ও পিপিআর প্রতিরোধে টিকা প্রদান এবং উন্নত জাতের বীজ দেওয়া।', processingTime: 'ইনস্ট্যান্ট সার্ভিস', fee: 'নামমাত্র সরকারি ফি', requiredDocuments: ['গবাদি পশুর বিবরণ'], helpline: '01700000019', department: 'উপজেলা প্রাণিসম্পদ দপ্তর ও ভেটেরিনারি হাসপাতাল', isActive: true, connectionType: 'internal', connectedPageUrl: '/livestock', connectedPageName: 'প্রাণিসম্পদ চিকিৎসা সার্ভিস' },
  { order: 35, title: 'উপজেলা মৎস্য অফিস মাছের পোনা ও পুকুর সংস্কার পরামর্শ', category: 'agri', icon: '🐟', subtitle: 'উন্নত কার্প ও পাঙ্গাস মাছ চাষের ট্রেইনিং ও সরকারি পোনা বিতরণ', description: 'পুকুরের পানি পরীক্ষা, রোগ দমন ও মাছ চাষীদের জন্য প্রদর্শনী খামার সাহায্য।', processingTime: 'কর্মদিবস', fee: 'বিনামূল্যে পরামর্শ', requiredDocuments: ['পুকুরের আয়তন ও তথ্য'], helpline: '01700000020', department: 'উপজেলা মৎস্য কর্মকর্তার কার্যালয়', isActive: true, connectionType: 'internal', connectedPageUrl: '/fisheries', connectedPageName: 'মৎস্য চাষ গাইড' },
  { order: 36, title: 'কৃষক বন্ধু কল সেন্টার (১৬১২৩) ও বালাইনাশক পরামর্শ', category: 'agri', icon: '📞', subtitle: 'ফসল রক্ষা, পোকা আক্রমণ ও মাটি পরীক্ষা বিশেষজ্ঞ পরামর্শ', description: 'সরাসরি কৃষি বিজ্ঞানীদের সাথে কথা বলে ফসলের ছবি পাঠিয়ে রোগের ওষুধ জানা।', processingTime: 'ইনস্ট্যান্ট কল', fee: 'সাধারণ কল চার্জ', requiredDocuments: ['আক্রান্ত ফসলের বিবরণ'], helpline: '16123', department: 'কৃষি তথ্য সার্ভিস (AIS)', isActive: true, connectionType: 'external', connectedPageUrl: 'http://ais.gov.bd', connectedPageName: 'কৃষি তথ্য সার্ভিস' },
  { order: 37, title: 'কৃষি যন্ত্রপাতি ভর্তুকি (Combine Harvester / Transplanter)', category: 'agri', icon: '🚜', subtitle: '৫০% থেকে ৭০% সরকারি উন্নয়ন সহায়তায় কম্বাইন হারভেস্টার', description: 'ধান কাটার আধুনিক মেশিন ও পাওয়ার টিলার ভর্তুকি মূল্যে কেনার অনলাইন দরখাস্ত।', processingTime: 'বার্ষিক কোটা অনুযায়ী', fee: 'ভর্তুকি বাদে বাকী মূল্য', requiredDocuments: ['কৃষক গ্রুপ পরিচিতি', 'জমির পরিমাণ'], helpline: '01700000021', department: 'উপজেলা কৃষি মেকানাইজেশন প্রকল্প', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/agri-machinery', connectedPageName: 'কৃষি যন্ত্রপাতি ভর্তুকি' },
  { order: 38, title: 'উপজেলা বিএডিসি (BADC) সার ও বীজ ডিলারশিপ তথ্য', category: 'agri', icon: '🌱', subtitle: 'অনুমোদিত সার ডিলার ও বীজ খুচরা বিক্রেতা তালিকা', description: 'ইউরিয়া, টিএসপি, ডিএপি ও এমপি সারের সরকারি নির্ধারিত খুচরা মূল্যের তালিকা।', processingTime: 'তাত্ক্ষণিক', fee: 'সরকারি নির্ধারিত দর', requiredDocuments: ['নগদ মূল্য'], helpline: '01700000022', department: 'বিএডিসি কৃষি ভবন', isActive: true, connectionType: 'internal', connectedPageUrl: '/agri/fertilizer-prices', connectedPageName: 'সার ও বীজের সরকারি রেট' },
  { order: 39, title: 'ডিজিটাল কৃষি আবহাওয়া পূর্বাভাস ও বন্যা সতর্কীকরণ', category: 'agri', icon: '🌦️', subtitle: 'পুঠিয়ার স্থানীয় তাপমাত্রা, বৃষ্টিপাত ও ঝড়ের পূর্বাভাস', description: 'কৃষকদের জন্য আবহাওয়ার ৫ দিনের প্যানোরামা তথ্য যাতে সময়মতো ধান কাটা যায়।', processingTime: 'লাইভ আপডেট', fee: 'বিনামূল্যে', requiredDocuments: ['নাই'], helpline: '01700000023', department: 'বাংলাদেশ আবহাওয়া অধিদপ্তর', isActive: true, connectionType: 'internal', connectedPageUrl: '/weather', connectedPageName: 'উপজেলা আবহাওয়া পেজ' },
  { order: 40, title: 'কৃষি ব্যাংক ও রাজশাহী কৃষি উন্নয়ন ব্যাংক (RAKUB) ঋণ', category: 'agri', icon: '🏦', subtitle: 'শস্য ঋণ, মৎস্য চাষ ও ডেইরি ফার্ম স্থাপনে সহজ শর্তে ঋণ', description: '৪% থেকে ৮% সুদে কৃষকদের শস্য ও পশু পালন ঋণ পাওয়ার নিয়মাবলী ও ফরম।', processingTime: '৭-১৫ দিন', fee: 'ব্যাংক সুদের হার', requiredDocuments: ['জমির খতিয়ান', 'এনআইডি', 'কৃষক পরিচয়পত্র'], helpline: '01700000024', department: 'রাকাব পুঠিয়া শাখা', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/rakub-loan', connectedPageName: 'কৃষি ঋণ পাওয়ার নির্দেশিকা' },

  // 41-48: Social Safety & Allowances
  { order: 41, title: 'বয়স্ক ভাতা (Old Age Allowance) অনলাইন আবেদন', category: 'social', icon: '👴', subtitle: 'বয়স্ক নাগরিকদের জন্য মাসিক সরকারি অনুদান', description: 'পুরুষ ৬৫ বছর ও মহিলা ৬২ বছর বয়সীদের জিটুপি (G2P) উপায়ে সরাসরি বিকাশ/নগদে ভাতা।', processingTime: 'বার্ষিক নির্বাচন', fee: 'সম্পূর্ণ বিনামূল্যে', requiredDocuments: ['এনআইডি কপি', 'অনলাইন জন্ম সনদ', 'বিকাশ/নগদ অ্যাকাউন্ট'], helpline: '109', department: 'উপজেলা সমাজসেবা কার্যালয়', isActive: true, connectionType: 'external', connectedPageUrl: 'http://mis.bhata.gov.bd', connectedPageName: 'সমাজসেবা ভাতা পোর্টাল' },
  { order: 42, title: 'বিধবা ও স্বামী নিগৃহীতা মহিলা ভাতা', category: 'social', icon: '👩', subtitle: 'দরিদ্র বিধবা ও দুস্থ নারীদের আর্থিক ভাতা সার্ভিস', description: 'ইউপি ও ওয়ার্ড কমিটির মাধ্যমে নির্বাচিত বিধবা মহিলাদের মোবাইল ওয়ালেটে ভাতা প্রদেয়।', processingTime: 'বার্ষিক বাছাই', fee: 'বিনামূল্যে', requiredDocuments: ['স্বামীর মৃত্যু সনদ', 'এনআইডি', 'চেয়ারম্যান সনদ'], helpline: '109', department: 'উপজেলা সমাজসেবা অফিস', isActive: true, connectionType: 'external', connectedPageUrl: 'http://mis.bhata.gov.bd', connectedPageName: 'বিধবা ভাতা পোর্টাল' },
  { order: 43, title: 'প্রতিবন্ধী আইডি কার্ড (Disability Card) ও সুবর্ণ কার্ড ভাতা', category: 'social', icon: '♿', subtitle: 'প্রতিবন্ধী ব্যক্তিদের জরিপ নিবন্ধকরণ ও ভাতা ব্যবস্থা', description: 'উপজেলা স্বাস্থ্য কমপ্লেক্সের ডাক্তারের সনদ নিয়ে সমাজসেবা অফিস থেকে সুবর্ণ কার্ড সংগ্রহ।', processingTime: '১০-১৫ দিন', fee: 'বিনামূল্যে', requiredDocuments: ['ডাক্তারি প্রতিবন্ধী প্রত্যয়ন', 'এনআইডি/জন্ম সনদ', 'ছবি'], helpline: '109', department: 'উপজেলা সমাজসেবা অধিদপ্তর', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/disability-card', connectedPageName: 'প্রতিবন্ধী সুবর্ণ কার্ড আবেদন' },
  { order: 44, title: 'মাতৃত্বকালীন ভাতা ও ভিজিডি (VGD/VCF) খাদ্য সহায়তা', category: 'social', icon: '🤰', subtitle: 'দরিদ্র মায়েদের জন্য মাতৃত্বকাল অর্থ ও ৩০ কেজি চাল বিতরণ', description: 'মহিলা বিষয়ক কর্মকর্তার কার্যালয়ের মাধ্যমে দুস্থ পরিবারকে চাউল ও প্রশিক্ষণ প্রদান।', processingTime: 'মৌসুমী তালিকা', fee: 'বিনামূল্যে', requiredDocuments: ['এনআইডি', 'গর্ভবতী কার্ড', 'ইউপি সুপারিশ'], helpline: '109', department: 'উপজেলা মহিলা বিষয়ক কর্মকর্তার কার্যালয়', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/maternity-allowance', connectedPageName: 'ভিজিডি ও মাতৃত্ব ভাতা' },
  { order: 45, title: 'মুক্তিযোদ্ধা সম্মানী ভাতা ও বীর নিবাস আবেদন', category: 'social', icon: '🎖️', subtitle: 'বীর মুক্তিযোদ্ধাদের সমন্বিত তালিকা ও স্মার্ট পরিচয়পত্র', description: 'সম্মানী ভাতা পেমেন্ট, চিকিৎসাসেবা ও গৃহহীন মুক্তিযোদ্ধাদের ঘর নির্মাণ বরাদ্দ।', processingTime: 'নিয়মিত কার্যক্রম', fee: 'বিনামূল্যে', requiredDocuments: ['মুক্তিযোদ্ধা গেজেট নম্বর', 'এনআইডি'], helpline: '01700000025', department: 'উপজেলা নির্বাহী অফিস ও সমাজসেবা', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/freedom-fighter', connectedPageName: 'মুক্তিযোদ্ধা বিষয়ক তথ্য' },
  { order: 46, title: 'টিসিবি (TCB) ফ্যামিলি কার্ডে ভর্তুকি মূল্যে নিত্যপণ্য', category: 'social', icon: '🛒', subtitle: 'কম দামে চাল, ডাল, তেল ও চিনি পাওয়ার টিসিবি স্মার্টকার্ড', description: 'পুঠিয়া উপজেলার নিম্ন আয়ের পরিবাদের জন্য বরাদ্দকৃত টিসিবি ফ্যামিলি কার্ড সেবা।', processingTime: 'কার্ড ডিস্ট্রিবিউশন', fee: 'ভর্তুকি মূল্য', requiredDocuments: ['এনআইডি ও ইউপি সুপারিশ'], helpline: '16121', department: 'উপজেলা নির্বাহী কর্মকর্তার কার্যালয়', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/tcb-card', connectedPageName: 'টিসিবি ফ্যামিলি কার্ড হিল' },
  { order: 47, title: 'কাজের বিনিময়ে খাদ্য (কাবিখা) ও টেস্ট রিলিফ (টিআর)', category: 'social', icon: '🏗️', subtitle: 'গ্রামীণ অবকাঠামো সংস্কার ও কর্মসংস্থান প্রকল্প', description: 'কাঁচা রাস্তা মেরামত, খেলার মাঠ ভরাট ও ধর্মীয় প্রতিষ্ঠান সংস্কারের উন্নয়ন প্রকল্প।', processingTime: 'প্রকল্প মেয়াদকাল', fee: 'বিনামূল্যে', requiredDocuments: ['প্রকল্প প্রস্তাবনা'], helpline: '01700000026', department: 'উপজেলা প্রকল্প বাস্তবায়ন কর্মকর্তা (PIO)', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/pio-projects', connectedPageName: 'টিআর ও কাবিখা প্রকল্প' },
  { order: 48, title: 'জাতীয় সামাজিক নিরাপত্তা বেষ্টনী (SSNP) সুবিধাভোগী চেক', category: 'social', icon: '🔍', subtitle: 'আপনার এনআইডি দিয়ে সকল সরকারি ভাতার স্ট্যাটাস যাচাই', description: 'আপনি কোন ভাতা পাওয়ার যোগ্য কিনা অথবা মোবাইল ওয়ালেটে ভাতার টাকা আসার তথ্য।', processingTime: 'ইনস্ট্যান্ট চেক', fee: 'বিনামূল্যে', requiredDocuments: ['এনআইডি নম্বর'], helpline: '109', department: 'সমাজকল্যাণ মন্ত্রণালয়', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/social-safety-search', connectedPageName: 'ভাতা স্ট্যাটাস সার্চ' },

  // 49-56: Emergency, Legal & Security
  { order: 49, title: 'পুঠিয়া থানা পুলিশ ও অনলাইন জিডি (General Diary)', category: 'emergency_legal', icon: '👮', subtitle: '২৪ ঘন্টা থানা ডিউটি অফিসার ও জরুরি পুলিশ সহায়তা', description: 'এনআইডি, মোবাইল বা ডকুমেন্টস হারালে ঘরে বসে অনলাইন জিডি করার নির্দেশনা।', processingTime: 'ইনস্ট্যান্ট জিডি', fee: 'বিনামূল্যে', requiredDocuments: ['এনআইডি', 'হারানো জিনিসের বিবরণ'], helpline: '999', department: 'পুঠিয়া থানা, রাজশাহী জেলা পুলিশ', isActive: true, connectionType: 'external', connectedPageUrl: 'https://gd.police.gov.bd', connectedPageName: 'অনলাইন জিডি পোর্টাল' },
  { order: 50, title: 'পুঠিয়া ফায়ার সার্ভিস ও সিভিল ডিফেন্স কন্টাক্ট', category: 'emergency_legal', icon: '🚒', subtitle: 'অগ্নিমুহূর্ত, সড়ক দুর্ঘটনা ও উদ্ধার অভিযানে জরুরি কল', description: 'উপজেলা ফায়ার স্টেশনের কন্ট্রোল রুম ও ফায়ার অফিসারদের সরাসরি জরুরি ফোন নম্বর।', processingTime: 'ইনস্ট্যান্ট রেসপন্স', fee: 'জরুরি উদ্ধার সেবা ফ্রী', requiredDocuments: ['দুর্ঘটনাস্থলের সুনির্দিষ্ট ঠিকানা'], helpline: '999', department: 'পুঠিয়া ফায়ার স্টেশন', isActive: true, connectionType: 'internal', connectedPageUrl: '/fire-service', connectedPageName: 'ফায়ার স্টেশন হেল্পলাইন' },
  { order: 51, title: 'জাতীয় জরুরি সেবা (৯৯৯) ও নারী-শিশু নির্যাতন প্রতিরোধ (১০৯)', category: 'emergency_legal', icon: '📞', subtitle: 'পুলিশ, ফায়ার ও অ্যাম্বুলেন্স এক নম্বরে এবং বাল্যবিয়ে রোধ', description: 'যেকোনো বিপদে বিনামূল্যে টোল-ফ্রি ৯৯৯ ও ১০৯ নম্বরে ২৪ ঘন্টা সাহায্য প্রাপ্তি।', processingTime: 'জরুরি কল', fee: 'টোল ফ্রি', requiredDocuments: ['স্থান ও জরুরি বিবরণ'], helpline: '999', department: 'জাতীয় জরুরি সেবা ৯৯৯', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/emergency-contacts', connectedPageName: 'জরুরি নম্বর তালিকা' },
  { order: 52, title: 'গ্রাম আদালত (Gram Adalat) বিচার ও বিরোধ নিষ্পত্তি', category: 'emergency_legal', icon: '⚖️', subtitle: 'ইউনিয়ন পরিষদে স্বল্প খরচে দেওয়ানি ও ফৌজদারি বিরোধ নিস্পত্তি', description: 'জমি সংক্রান্ত ছোটখাটো বিরোধ বা ঝগড়া বিবাদ আদালতের চক্কর ছাড়া ইউপিতে নিষ্পত্তি।', processingTime: '১৫-৩০ দিন', fee: '১০ - ২০ টাকা (আবেদন ফি)', requiredDocuments: ['অভিযোগপত্র', 'বিবাদীর নাম-ঠিকানা'], helpline: '01700000027', department: 'সংশ্লিষ্ট ইউনিয়ন পরিষদ গ্রাম আদালত', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/gram-adalat', connectedPageName: 'গ্রাম আদালত আবেদন গাইড' },
  { order: 53, title: 'লিগ্যাল এইড (Legal Aid) সরকারি বিনামূল্যে আইনি সহায়তা', category: 'emergency_legal', icon: '👨‍⚖️', subtitle: 'দরিদ্র ও অসহায় বিচারপ্রার্থীদের বিনামূল্যে আইনজীবী ও মামলা পরিচালনা', description: 'জাতীয় আইনগত সহায়তা প্রদান সংস্থার মাধ্যমে রাজাশাহী জেলা জজ কোর্টে আইনি সাহায্য।', processingTime: 'আবেদন সাপেক্ষে', fee: 'সম্পূর্ণ বিনামূল্যে', requiredDocuments: ['আয়ের প্রত্যয়ন', 'মামলার তথ্য'], helpline: '16430', department: 'জেলা লিগ্যাল এইড অফিস, রাজশাহী', isActive: true, connectionType: 'external', connectedPageUrl: 'http://www.nlaso.gov.bd', connectedPageName: 'সরকারি লিগ্যাল এইড' },
  { order: 54, title: 'উপজেলা নির্বাহী অফিস মোবাইল কোর্ট (Mobile Court) অভিযোগ', category: 'emergency_legal', icon: '🏛️', subtitle: 'ভেজাল বিরোধী অভিযান, ইভটিজিং ও অবৈধ বালু উত্তোলন রোধ', description: 'ইউএনও এবং সহকারী কমিশনার (ভূমি) পরিচালিত ভ্রাম্যমাণ আদালতে জরুরি অভিযোগ প্রদান।', processingTime: 'দ্রুত পদক্ষেপ', fee: 'বিনামূল্যে', requiredDocuments: ['ঘটনার সুনির্দিষ্ট তথ্য ও প্রমাণ'], helpline: '01700000028', department: 'উপজেলা নির্বাহী কর্মকর্তার কার্যালয় (ইউএনও)', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/mobile-court', connectedPageName: 'ইউএনও মেজিস্ট্রেসি সেল' },
  { order: 55, title: 'জাতীয় ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর অভিযোগ (16121)', category: 'emergency_legal', icon: '🛍️', subtitle: 'দোকানদার কর্তৃক বেশি দাম নেওয়া ও ভেজাল পণ্যের বিচার', description: 'পণ্যের নির্ধারিত মূল্যের চেয়ে বেশি দাম নেওয়া বা মেয়াদোত্তীর্ণ পণ্য বিক্রির আইনি বিচার।', processingTime: '১৫ দিন', fee: 'বিনামূল্যে (অভিযোগকারী ২৫% জরিমানা পায়)', requiredDocuments: ['কেনার ক্যাশ মেমো', 'পণ্যের ছবি'], helpline: '16121', department: 'ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর', isActive: true, connectionType: 'external', connectedPageUrl: 'https://dncrp.portal.gov.bd', connectedPageName: 'ভোক্তা অধিকার জমা' },
  { order: 56, title: 'অনলাইন সাইবার ক্রাইম ও ফেসবুক হ্যাকিং কমপ্লেন সেল', category: 'emergency_legal', icon: '🌐', subtitle: 'ফেসবুক আইডি হ্যাক, সাইবার বুলিং ও ফেক আইডি রিপোর্ট', description: 'পুলিশ সাইবার সাপোর্ট ফর উইমেন (PCSW) ও সাইবার ক্রাইম ইউনিটে অভিযোগ দায়ের।', processingTime: '১-৩ দিন', fee: 'বিনামূল্যে', requiredDocuments: ['স্ক্রিনশট', 'ইউআরএল লিংক'], helpline: '01769691509', department: 'পুলিশ সাইবার হেল্পডেস্ক', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/cyber-support', connectedPageName: 'সাইবার ক্রাইম হেল্পলাইন' },

  // 57-63: Utilities, Business & Governance
  { order: 57, title: 'নেসকো / পল্লী বিদ্যুৎ নতুন বিদ্যুৎ সংযোগ ও বিল পরিশোধ', category: 'utility_biz', icon: '⚡', subtitle: 'অনলাইনে আবাসিক ও বাণিজ্যিক মিটারের আবেদন এবং বিল চেক', description: 'রাজশাহী পল্লী বিদ্যুৎ সমিতি-২ বা নেসকো অফিসে নতুন মিটার পাওয়ার আবেদন।', processingTime: '৩-৭ দিন', fee: 'মিটার জামানত ও সরকারি ফি', requiredDocuments: ['জমির খতিয়ান/দলিল', 'এনআইডি', 'ওয়ারিং ইন্সপেকশন রিপোর্টিং'], helpline: '16999', department: 'পল্লী বিদ্যুৎ সমিতি / নেসকো পুঠিয়া', isActive: true, connectionType: 'external', connectedPageUrl: 'http://rebpbs.com.bd', connectedPageName: 'পল্লী বিদ্যুৎ নতুন মিটার' },
  { order: 58, title: 'ইউনিয়ন পরিষদ ও পৌরসভা ট্রেড লাইসেন্স (Trade License)', category: 'utility_biz', icon: '💼', subtitle: 'ব্যবসা শুরু ও ব্যাংক লোনের জন্য নতুন ও নবায়ন লাইসেন্স', description: 'পুঠিয়া উপজেলার যেকোনো দোকানে বৈধ ব্যবসা পরিচালনার জন্য ট্রেড লাইসেন্স গ্রহণ।', processingTime: '১-২ দিন', fee: 'ব্যবসার ধরন অনুযায়ী ২০০-২০০০ টাকা', requiredDocuments: ['দোকান ভাড়ার চুক্তিপত্র', 'এনআইডি', 'ছবি'], helpline: '01700000029', department: 'ইউনিয়ন পরিষদ / পুঠিয়া পৌরসভা', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/trade-license', connectedPageName: 'ট্রেড লাইসেন্স আবেদন' },
  { order: 59, title: 'অনলাইন ই-টিআইএন (e-TIN) সনদপত্র তৈরি', category: 'utility_biz', icon: '📄', subtitle: 'বিনামূল্যে ৫ মিনিটে জাতীয় আয়কর টিআইএন নম্বর তৈরি', description: 'এনবিআর পোর্টাল থেকে যেকোনো নাগরিকের নতুন ই-টিআইএন নিবন্ধন ও টিআইএন সার্টিফিকেট।', processingTime: '৫ মিনিট', fee: 'সম্পূর্ণ বিনামূল্যে', requiredDocuments: ['এনআইডি নম্বর', 'মোবাইল'], helpline: '16555', department: 'জাতীয় রাজস্ব বোর্ড (NBR)', isActive: true, connectionType: 'external', connectedPageUrl: 'https://secure.incometax.gov.bd', connectedPageName: 'ই-টিআইএন রেজিস্ট্রি পোর্টাল' },
  { order: 60, title: 'পুঠিয়া পোস্ট অফিস (ডাকঘর) সঞ্চয়পত্র ও স্পিড পোস্ট', category: 'utility_biz', icon: '📮', subtitle: 'ডাকঘর সঞ্চয় ব্যাংক, পারিবারিক সঞ্চয়পত্র ও পার্সেল সার্ভিস', description: 'চিঠি, সরকারি জরুরি কাজ ও পার্সেল নিরাপদে ট্র্যাকিংয়ের মাধ্যমে গন্তব্যে পাঠানো।', processingTime: '১-৩ দিন', fee: 'ওজন ও দূরত্বের ওপর নির্ভর করে', requiredDocuments: ['প্রেরক ও প্রাপকের সুনির্দিষ্ট ঠিকানা'], helpline: '01700000030', department: 'পুঠিয়া উপজেলা পোস্ট অফিস', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/post-office', connectedPageName: 'পোস্ট অফিস সেবা ও ট্র্যাকিং' },
  { order: 61, title: 'ইউনিয়ন ডিজিটাল সেন্টার (UDC) অন-স্টপ অনলাইন সেবা', category: 'utility_biz', icon: '🖥️', subtitle: 'উপজেলার সকল ইউডিটিসিতে কম খরচে সকল সরকারি ই-সেবা', description: 'কম্পিউটার প্রিন্ট, ছবি তোলা, আবেদন ফরম পূরণ ও সরকারি পরীক্ষার অনলাইন এডমিট।', processingTime: 'ইনস্ট্যান্ট', fee: 'ইউডিসি চার্ট অনুযায়ী', requiredDocuments: ['সংশ্লিষ্ট কাগজপত্র'], helpline: '01700000031', department: 'ইউনিয়ন ডিজিটাল সেন্টার উদ্যোক্তা নেটওয়ার্ক', isActive: true, connectionType: 'internal', connectedPageUrl: '/digital-centers', connectedPageName: 'ইউডিএসসি উদ্যোক্তা তালিকা' },
  { order: 62, title: 'অনলাইন ড্রাইভিং লাইসেন্স ও বিআরটিএ (BRTA) সার্ভিস', category: 'utility_biz', icon: '🏍️', subtitle: 'লার্নার কার্ড, ড্রাইভিং লাইসেন্স পরীক্ষা ও বাইক রেজিস্ট্রেশন', description: 'বিআরটিএ সেবা বাতায়নের (BSP) মাধ্যমে ঘরে বসে লার্নার লাইসেন্স তৈরি।', processingTime: 'পরীক্ষার শিডিউল সাপেক্ষে', fee: 'বিআরটিএ নির্ধারিত ফি (চালান)', requiredDocuments: ['মেডিকেল ফিটনেস সনদ', 'এনআইডি', 'ইউপি সনদ'], helpline: '16107', department: 'বিআরটিএ রাজশাহী সার্কেল', isActive: true, connectionType: 'external', connectedPageUrl: 'https://bsp.brta.gov.bd', connectedPageName: 'BRTA সেবা বাতায়ন' },
  { order: 63, title: 'উপজেলা সমবায় সমিতি (Cooperative) নিবন্ধন ও নিরীক্ষা', category: 'utility_biz', icon: '🤝', subtitle: 'সঞ্চয় ও ঋণদান সমবায় সমিতি সরকারি নিবন্ধন ও অডিট', description: 'কৃষক বা যুবকদের নতুন সমবায় সমিতি গঠন, গঠনতন্ত্র অনুমোদন ও বার্ষিক অডিট রিপোর্ট।', processingTime: '৩০ কর্মদিবস', fee: 'সমিতির মূলধন অনুযায়ী সরকারি ফি', requiredDocuments: ['প্রস্তাবিত ২০ জন সদস্যের তালিকা', 'গঠনতন্ত্র'], helpline: '01700000032', department: 'উপজেলা সমবায় কর্মকর্তার কার্যালয়', isActive: true, connectionType: 'internal', connectedPageUrl: '/services/cooperative', connectedPageName: 'সমবায় সমিতি আবেদন নির্দেশিকা' },
];

export default function ServiceCatalogManagement() {
  const { user } = useAuth();
  const [services, setServices] = useState<UpazilaServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'grid64' | 'catalog63' | 'submissions' | 'edits' | 'reports'>('grid64');

  // Moderation queues
  const [submissions, setSubmissions] = useState<UpazilaServiceSubmission[]>([]);
  const [editRequests, setEditRequests] = useState<UpazilaServiceEditRequest[]>([]);
  const [reports, setReports] = useState<UpazilaServiceReport[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UpazilaServiceItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Connection Preview Modal
  const [previewConnection, setPreviewConnection] = useState<UpazilaServiceItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<UpazilaServiceItem, 'id'>>({
    order: 1,
    title: '',
    titleEn: '',
    category: 'health',
    icon: '🩺',
    subtitle: '',
    description: '',
    processingTime: '',
    fee: '',
    requiredDocuments: [''],
    helpline: '',
    department: '',
    isActive: true,
    connectionType: 'internal',
    connectedPageUrl: '/services/health',
    connectedPageName: 'হাসপাতাল ও স্বাস্থ্য সেবা'
  });

  // Load Services, Submissions, Edit Requests & Reports from Firestore
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'upazila_services'), orderBy('order', 'asc'));
    const unsubscribeServices = onSnapshot(q, (snapshot) => {
      const items: UpazilaServiceItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as UpazilaServiceItem);
      });
      setServices(items);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching services:', err);
      setLoading(false);
    });

    const unsubscribeSubmissions = upazilaServicesService.subscribeSubmissions((items) => {
      setSubmissions(items);
    });

    const unsubscribeEdits = upazilaServicesService.subscribeEditRequests((items) => {
      setEditRequests(items);
    });

    const unsubscribeReports = upazilaServicesService.subscribeReports((items) => {
      setReports(items);
    });

    return () => {
      unsubscribeServices();
      unsubscribeSubmissions();
      unsubscribeEdits();
      unsubscribeReports();
    };
  }, []);

  // Moderation Action Handlers
  const handleApproveSubmission = async (sub: UpazilaServiceSubmission) => {
    try {
      await upazilaServicesService.approveSubmission(sub, {
        uid: user?.uid || '',
        name: user?.displayName || user?.email || 'Super Admin'
      });
      toast.success(`"${sub.itemTitle}" অনুমোদন করা হয়েছে ও লাইভ ডাটাবেজে যুক্ত করা হয়েছে!`);
    } catch (err) {
      console.error(err);
      toast.error('অনুমোদন করতে সমস্যা হয়েছে');
    }
  };

  const handleRejectSubmission = async (subId: string) => {
    const note = window.prompt('বাতিলের কারণ উল্লেখ করুন (ঐচ্ছিক):', 'তথ্য অসম্পূর্ণ বা ভুয়া');
    if (note === null) return;
    try {
      await upazilaServicesService.rejectSubmission(subId, note, {
        uid: user?.uid || '',
        name: user?.displayName || user?.email || 'Super Admin'
      });
      toast.success('সাবমিশনটি বাতিল করা হয়েছে');
    } catch (err) {
      console.error(err);
      toast.error('বাতিল করতে সমস্যা হয়েছে');
    }
  };

  const handleApproveEditRequest = async (editReq: UpazilaServiceEditRequest) => {
    try {
      await upazilaServicesService.approveEditRequest(editReq, {
        uid: user?.uid || '',
        name: user?.displayName || user?.email || 'Super Admin'
      });
      toast.success('এডিট রিকোয়েস্ট অনুমোদন ও সেবার তথ্য আপডেট করা হয়েছে!');
    } catch (err) {
      console.error(err);
      toast.error('অনুমোদন করতে সমস্যা হয়েছে');
    }
  };

  const handleRejectEditRequest = async (editId: string) => {
    const note = window.prompt('বাতিলের কারণ উল্লেখ করুন:', 'প্রস্তাবিত সংশোধন সঠিক নয়');
    if (note === null) return;
    try {
      await upazilaServicesService.rejectEditRequest(editId, note, {
        uid: user?.uid || '',
        name: user?.displayName || user?.email || 'Super Admin'
      });
      toast.success('এডিট রিকোয়েস্ট বাতিল করা হয়েছে');
    } catch (err) {
      console.error(err);
      toast.error('বাতিল করতে সমস্যা হয়েছে');
    }
  };

  const handleResolveReport = async (reportId: string) => {
    const action = window.prompt('কী ব্যবস্থা গ্রহণ করা হয়েছে লিখুন:', 'তথ্য আপডেট করা হয়েছে ও রিপোর্ট নিষ্পত্তি করা হলো');
    if (action === null) return;
    try {
      await upazilaServicesService.resolveReport(reportId, action, {
        uid: user?.uid || '',
        name: user?.displayName || user?.email || 'Super Admin'
      });
      toast.success('রিপোর্টটি নিষ্পত্তি করা হয়েছে');
    } catch (err) {
      console.error(err);
      toast.error('রিপোর্ট সমাধান করতে সমস্যা হয়েছে');
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await upazilaServicesService.dismissReport(reportId, 'ভিত্তিহীন রিপোর্ট', {
        uid: user?.uid || '',
        name: user?.displayName || user?.email || 'Super Admin'
      });
      toast.success('রিপোর্টটি ডিসমিস করা হয়েছে');
    } catch (err) {
      console.error(err);
      toast.error('ডিসমিস করতে সমস্যা হয়েছে');
    }
  };

  // Seed default 63 services if empty
  const handleSeedDefaultServices = async () => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে পুঠিয়া উপজেলার পূর্ণাঙ্গ ৬৩টি ডিজিটাল সেবা ডাটাবেজে রিকভার/সিড করতে চান?')) {
      return;
    }

    setIsSeeding(true);
    try {
      let addedCount = 0;
      for (const s of SEED_63_SERVICES) {
        const customId = `service_${s.order}`;
        await setDoc(doc(db, 'upazila_services', customId), {
          ...s,
          updatedAt: serverTimestamp(),
          updatedBy: user?.displayName || user?.email || 'Super Admin'
        }, { merge: true });
        addedCount++;
      }
      toast.success(`সফলভাবে ${addedCount}টি পুঠিয়া উপজেলা সেবা ডাটাবেজে লাইভ করা হয়েছে!`);
    } catch (err) {
      console.error('Seeding error:', err);
      toast.error('সিড করার সময় সমস্যা হয়েছে।');
    } finally {
      setIsSeeding(false);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (item: UpazilaServiceItem) => {
    const newStatus = !item.isActive;
    try {
      await updateDoc(doc(db, 'upazila_services', item.id), {
        isActive: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: user?.displayName || user?.email || 'Admin'
      });
      toast.success(`"${item.title}" এখন ${newStatus ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}`);
    } catch (err) {
      console.error('Status toggle error:', err);
      toast.error('স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে');
    }
  };

  // Quick Order Change (Up / Down)
  const handleOrderChange = async (item: UpazilaServiceItem, direction: 'up' | 'down') => {
    const currentOrder = item.order;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    
    try {
      await updateDoc(doc(db, 'upazila_services', item.id), {
        order: newOrder,
        updatedAt: serverTimestamp(),
        updatedBy: user?.displayName || user?.email || 'Admin'
      });
      toast.success(`পজিশন #${newOrder} আপডেট হয়েছে`);
    } catch (err) {
      console.error('Order change error:', err);
      toast.error('পজিশন আপডেট করা সম্ভব হয়নি');
    }
  };

  // Direct Position Input Edit
  const handleDirectOrderUpdate = async (item: UpazilaServiceItem, newOrderVal: number) => {
    if (isNaN(newOrderVal) || newOrderVal < 1) return;
    try {
      await updateDoc(doc(db, 'upazila_services', item.id), {
        order: newOrderVal,
        updatedAt: serverTimestamp(),
        updatedBy: user?.displayName || user?.email || 'Admin'
      });
      toast.success(`পজিশন #${newOrderVal} আপডেট করা হয়েছে`);
    } catch (err) {
      console.error('Direct order error:', err);
    }
  };

  // Open Create Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    const nextOrder = services.length > 0 ? Math.max(...services.map(s => s.order || 0)) + 1 : 1;
    setFormData({
      order: nextOrder,
      title: '',
      titleEn: '',
      category: 'health',
      icon: '🩺',
      subtitle: '',
      description: '',
      processingTime: '১-৩ কর্মদিবস',
      fee: 'বিনামূল্যে',
      requiredDocuments: ['এনআইডি কপি'],
      helpline: '16122',
      department: 'উপজেলা প্রশাসন',
      isActive: true,
      connectionType: 'internal',
      connectedPageUrl: '/services/general',
      connectedPageName: 'সাধারণ সেবাপাতাসমূহ'
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: UpazilaServiceItem) => {
    setEditingItem(item);
    setFormData({
      order: item.order || 1,
      title: item.title || '',
      titleEn: item.titleEn || '',
      category: item.category || 'health',
      icon: item.icon || '🩺',
      subtitle: item.subtitle || '',
      description: item.description || '',
      processingTime: item.processingTime || '',
      fee: item.fee || '',
      requiredDocuments: item.requiredDocuments?.length ? item.requiredDocuments : [''],
      helpline: item.helpline || '',
      department: item.department || '',
      isActive: item.isActive ?? true,
      connectionType: item.connectionType || 'internal',
      connectedPageUrl: item.connectedPageUrl || '',
      connectedPageName: item.connectedPageName || ''
    });
    setIsModalOpen(true);
  };

  // Delete Service Item
  const handleDeleteService = async (item: UpazilaServiceItem) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${item.title}" সেবাটি মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'upazila_services', item.id));
      toast.success('সেবাটি সফলভাবে মুছে ফেলা হয়েছে');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('মুছে ফেলার সময় ত্রুটি দেখা দিয়েছে');
    }
  };

  // Save Service (Create or Update)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('দয়া করে সেবার শিরোনাম প্রবেশ করুন');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        order: Number(formData.order) || 1,
        title: formData.title.trim(),
        requiredDocuments: formData.requiredDocuments.filter(d => d.trim() !== ''),
        updatedAt: serverTimestamp(),
        updatedBy: user?.displayName || user?.email || 'Admin'
      };

      if (editingItem) {
        await updateDoc(doc(db, 'upazila_services', editingItem.id), payload);
        toast.success('সেবা তথ্য আপডেট সফল হয়েছে');
      } else {
        await addDoc(collection(db, 'upazila_services'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        toast.success('নতুন সেবা সফলভাবে যুক্ত হয়েছে');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Save error:', err);
      toast.error('সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Services
  const filteredServices = services.filter((s) => {
    const matchesSearch = 
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.order) === searchQuery.trim();

    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesStatus = 
      statusFilter === 'all' ? true : 
      statusFilter === 'active' ? s.isActive === true : 
      s.isActive === false;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Module Subtab Switcher Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('grid64')}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-black transition-all border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'grid64'
              ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-md'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Grid size={15} />
          <span>৬৪টি সেবা বাটন গ্রিড</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('catalog63')}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-black transition-all border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'catalog63'
              ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-md'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles size={15} />
          <span>৬৩টি ই-সেবা ক্যাটালগ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('submissions')}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-black transition-all border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'submissions'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Inbox size={15} />
          <span>ইউজার সাবমিশন</span>
          {submissions.filter(s => s.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black">
              {submissions.filter(s => s.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('edits')}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-black transition-all border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'edits'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileEdit size={15} />
          <span>এডিট রিকোয়েস্ট</span>
          {editRequests.filter(e => e.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 bg-indigo-200 text-indigo-950 rounded-full text-[10px] font-black">
              {editRequests.filter(e => e.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('reports')}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-black transition-all border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'reports'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert size={15} />
          <span>ইউজার রিপোর্ট</span>
          {reports.filter(r => r.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 bg-rose-200 text-rose-950 rounded-full text-[10px] font-black">
              {reports.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'grid64' && (
        <ServicesGridManagement />
      )}

      {/* USER SUBMISSIONS MODERATION VIEW */}
      {activeSubTab === 'submissions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Inbox className="text-amber-600" size={22} />
                <span>ইউজার সাবমিটকৃত নতুন তথ্য ও সেবা মডারেশন</span>
              </h2>
              <p className="text-xs font-medium text-slate-500">
                নাগরিকদের জমা দেওয়া নতুন সেবা বা প্রতিষ্ঠানের তথ্য রিভিউ, অনুমোদন ও সরাসরি ৬৩টি সেবায় লাইভ করুন।
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-black border border-amber-200">
              মোট: {submissions.length}টি
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Inbox size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-500">কোনো ইউজার সাবমিশন পেন্ডিং নেই</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-black rounded-md">
                        {sub.serviceTitle}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">{sub.itemTitle}</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      sub.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {sub.status === 'approved' ? 'অনুমোদিত' : sub.status === 'rejected' ? 'বাতিল' : 'পেন্ডিং'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <p><strong className="text-slate-600">যোগাযোগ:</strong> {sub.contactNumber || 'N/A'}</p>
                    <p><strong className="text-slate-600">ঠিকানা:</strong> {sub.address || 'N/A'}</p>
                    <p className="sm:col-span-2"><strong className="text-slate-600">বিবরণ:</strong> {sub.description || 'বিবরণ দেওয়া হয়নি'}</p>
                    <p className="sm:col-span-2 text-[11px] text-slate-400">
                      জমা প্রদানকারী: {sub.submittedByName} ({sub.submittedByPhone || 'ফোন নম্বর নেই'})
                    </p>
                  </div>

                  {sub.status === 'pending' && (
                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => handleApproveSubmission(sub)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black border-none cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <ThumbsUp size={14} />
                        <span>অনুমোদন ও লাইভ করুন</span>
                      </button>
                      <button
                        onClick={() => handleRejectSubmission(sub.id!)}
                        className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold border-none cursor-pointer flex items-center gap-1.5"
                      >
                        <ThumbsDown size={14} />
                        <span>বাতিল করুন</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* USER EDIT REQUESTS MODERATION VIEW */}
      {activeSubTab === 'edits' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileEdit className="text-indigo-600" size={22} />
                <span>ইউজার তথ্য সংশোধন ও এডিট রিকোয়েস্ট মডারেশন</span>
              </h2>
              <p className="text-xs font-medium text-slate-500">
                বিদ্যমান সেবার তথ্যে নাগরিকদের প্রেরিত সংশোধন প্রস্তাবগুলো যাচাই করে অনুমোদন প্রদান করুন।
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-800 rounded-full text-xs font-black border border-indigo-200">
              মোট: {editRequests.length}টি
            </span>
          </div>

          {editRequests.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileEdit size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-500">কোনো এডিট রিকোয়েস্ট পেন্ডিং নেই</p>
            </div>
          ) : (
            <div className="space-y-4">
              {editRequests.map((edit) => (
                <div key={edit.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-black rounded-md">
                        {edit.serviceTitle}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">সংশোধন প্রস্তাব</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      edit.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      edit.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {edit.status === 'approved' ? 'অনুমোদিত' : edit.status === 'rejected' ? 'বাতিল' : 'পেন্ডিং'}
                    </span>
                  </div>

                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 text-xs">
                    <p><strong className="text-slate-700">কারণ:</strong> {edit.editReason}</p>
                    <p><strong className="text-slate-700">প্রস্তাবিত শিরোনাম:</strong> {edit.proposedTitle || 'অপরিবর্তিত'}</p>
                    <p><strong className="text-slate-700">প্রস্তাবিত হেল্পলাইন:</strong> {edit.proposedHelpline || 'অপরিবর্তিত'}</p>
                    <p><strong className="text-slate-700">প্রস্তাবিত বিবরণ:</strong> {edit.proposedDetails || 'অপরিবর্তিত'}</p>
                    <p className="text-[11px] text-slate-400">প্রেরক: {edit.submittedByName}</p>
                  </div>

                  {edit.status === 'pending' && (
                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => handleApproveEditRequest(edit)}
                        className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black border-none cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <ThumbsUp size={14} />
                        <span>সংশোধন প্রয়োগ করুন</span>
                      </button>
                      <button
                        onClick={() => handleRejectEditRequest(edit.id!)}
                        className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold border-none cursor-pointer flex items-center gap-1.5"
                      >
                        <ThumbsDown size={14} />
                        <span>বাতিল করুন</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* USER REPORTS MODERATION VIEW */}
      {activeSubTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="text-rose-600" size={22} />
                <span>ইউজার রিপোর্ট ও কমপ্লেন্ট ম্যানেজমেন্ট</span>
              </h2>
              <p className="text-xs font-medium text-slate-500">
                নাগরিকদের রিপোর্টকৃত ভুল তথ্য, বন্ধ প্রতিষ্ঠান বা সার্ভিসের অভিযোগ অনুসন্ধান ও সমাধান করুন।
              </p>
            </div>
            <span className="px-3 py-1 bg-rose-50 text-rose-800 rounded-full text-xs font-black border border-rose-200">
              মোট: {reports.length}টি
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ShieldAlert size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-500">কোনো রিপোর্ট বা অভিযোগ নেই</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-md">
                        {rep.serviceTitle}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">অভিযোগ: {rep.reportReason}</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      rep.status === 'dismissed' ? 'bg-slate-200 text-slate-700' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {rep.status === 'resolved' ? 'নিষ্পত্তি' : rep.status === 'dismissed' ? 'ডিসমিস' : 'পেন্ডিং'}
                    </span>
                  </div>

                  <div className="p-3 bg-rose-50/40 border border-rose-100 rounded-xl space-y-1 text-xs">
                    <p><strong className="text-slate-700">অভিযোগের বিবরণ:</strong> {rep.details}</p>
                    <p className="text-[11px] text-slate-400">রিপোর্টার: {rep.reporterName}</p>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => handleResolveReport(rep.id!)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black border-none cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 size={14} />
                        <span>সমাধান বা ব্যবস্থা গ্রহণ</span>
                      </button>
                      <button
                        onClick={() => handleDismissReport(rep.id!)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold border-none cursor-pointer flex items-center gap-1.5"
                      >
                        <X size={14} />
                        <span>ডিসমিস করুন</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'catalog63' && (
        <>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-black tracking-wider text-emerald-100 uppercase border border-white/10">
            <Sparkles size={14} className="text-emerald-300" />
            ৬৩টি নাগরিক সেবা কন্ট্রোল সেন্টার (Hub)
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">
            উপজেলা ৬৩টি সেবা ক্যাটালগ ও লিংক কানেকশন
          </h1>
          <p className="text-emerald-100/90 text-xs md:text-sm font-medium leading-relaxed max-w-3xl">
            পুঠিয়া উপজেলার সকল নাগরিক সেবা (স্বাস্থ্য, শিক্ষা, কৃষি, নামজারি, জন্মনিবন্ধন, ভাতা, পুলিশ ইত্যাদি) এখানে সুবিন্যস্তভাবে সাজানো, সক্রিয়/নিষ্ক্রিয় ও কানেক্টেড পেজ রুটে সংযুক্ত করুন।
          </p>

          <div className="pt-2 flex flex-wrap gap-3 items-center">
            <button
              onClick={handleOpenAddModal}
              className="bg-white text-emerald-800 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer border-none"
            >
              <Plus size={16} />
              <span>নতুন সেবা যুক্ত করুন</span>
            </button>

            {services.length < 63 && (
              <button
                onClick={handleSeedDefaultServices}
                disabled={isSeeding}
                className="bg-emerald-500/30 hover:bg-emerald-500/40 text-white border border-emerald-300/40 px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm"
              >
                <RefreshCw size={14} className={isSeeding ? 'animate-spin' : ''} />
                <span>পুঠিয়ার ৬৩টি মডেল সেবা সিড করুন</span>
              </button>
            )}

            <div className="ml-auto bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-emerald-100 border border-white/10 flex items-center gap-3">
              <span>মোট লাইভ সেবা: <strong className="text-white font-black text-sm">{services.length}টি</strong></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>সক্রিয়: <strong className="text-emerald-300 font-black">{services.filter(s => s.isActive).length}টি</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            ৬৩
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">নিবন্ধিত সেবা</p>
            <p className="text-lg font-black text-slate-800">{services.length}টি</p>
          </div>
        </div>
        
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">সক্রিয় প্রকাশ</p>
            <p className="text-lg font-black text-teal-700">{services.filter(s => s.isActive).length}টি</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <LinkIcon size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">পেজ কানেক্টেড</p>
            <p className="text-lg font-black text-indigo-700">{services.filter(s => s.connectedPageUrl).length}টি</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">মোট ক্যাটাগরি</p>
            <p className="text-lg font-black text-amber-700">{SERVICE_CATEGORIES.length}টি</p>
          </div>
        </div>
      </div>

      {/* Category Pills & Filters Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-4">
        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2.5 pt-1 scrollbar-none w-full">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap shrink-0 transition-all border cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-emerald-700/20 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🌟 সকল সেবা (All 63)
          </button>
          {SERVICE_CATEGORIES.map((cat) => {
            const count = services.filter(s => s.category === cat.id).length;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 transition-all border cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? `${cat.color} font-black ring-2 ring-emerald-500/30`
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-[10px] bg-white/70 px-1.5 py-0.5 rounded-full font-black ml-1">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সেবার নাম, বিভাগ, অর্ডার বা বিবরণ দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Filter size={14} /> স্ট্যাটাস:
            </span>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-extrabold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="all">সব স্ট্যাটাস</option>
              <option value="active">সক্রিয় (Active)</option>
              <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400">৬৩টি সেবার তালিকা লোড হচ্ছে...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs space-y-3">
            <AlertCircle size={36} className="mx-auto text-slate-300" />
            <p>কোনো সেবা পাওয়া যায়নি।</p>
            {services.length === 0 && (
              <button
                onClick={handleSeedDefaultServices}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold text-xs border-none cursor-pointer"
              >
                ৬৩টি ডিফল্ট সেবা লোড করুন
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3.5 w-20 text-center">ক্রম (Pos)</th>
                  <th className="px-4 py-3.5">সেবার নাম ও আইকন</th>
                  <th className="px-4 py-3.5">ক্যাটাগরি ও বিভাগ</th>
                  <th className="px-4 py-3.5">সময় ও ফি</th>
                  <th className="px-4 py-3.5">কানেক্টেড পেজ (Link)</th>
                  <th className="px-4 py-3.5 text-center">স্ট্যাটাস</th>
                  <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs bg-white">
                {filteredServices.map((item) => {
                  const catInfo = SERVICE_CATEGORIES.find(c => c.id === item.category);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Position / Order */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleOrderChange(item, 'up')}
                              className="text-slate-300 hover:text-emerald-600 border-none bg-transparent cursor-pointer p-0.5"
                              title="উপরে নিয়ে যান"
                            >
                              <MoveUp size={12} />
                            </button>
                            <button
                              onClick={() => handleOrderChange(item, 'down')}
                              className="text-slate-300 hover:text-emerald-600 border-none bg-transparent cursor-pointer p-0.5"
                              title="নিচে নিয়ে যান"
                            >
                              <MoveDown size={12} />
                            </button>
                          </div>
                          <input
                            type="number"
                            defaultValue={item.order || 1}
                            onBlur={(e) => handleDirectOrderUpdate(item, parseInt(e.target.value))}
                            className="w-10 text-center py-1 text-xs font-black bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </td>

                      {/* Service Title & Icon */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-2.5">
                          <span className="text-2xl shrink-0 p-1.5 bg-slate-100 rounded-xl">{item.icon || '🩺'}</span>
                          <div>
                            <p className="font-extrabold text-slate-800 leading-snug">{item.title}</p>
                            <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{item.subtitle}</p>
                            {item.helpline && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md mt-1">
                                📞 {item.helpline}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Department */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${catInfo?.color || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            <span>{catInfo?.icon}</span>
                            <span>{catInfo?.name || item.category}</span>
                          </span>
                          <p className="text-[11px] font-bold text-slate-500 line-clamp-1">{item.department}</p>
                        </div>
                      </td>

                      {/* Time & Fee */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-bold text-slate-700">⏱️ {item.processingTime || 'প্রযোজ্য নয়'}</p>
                          <p className="text-[10px] font-extrabold text-emerald-600">💵 {item.fee || 'বিনামূল্যে'}</p>
                        </div>
                      </td>

                      {/* Connected Page Link */}
                      <td className="px-4 py-3.5">
                        {item.connectedPageUrl ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-xl max-w-[160px] truncate">
                              <LinkIcon size={12} className="shrink-0 text-indigo-500" />
                              <span className="truncate">{item.connectedPageName || item.connectedPageUrl}</span>
                            </span>
                            <button
                              onClick={() => setPreviewConnection(item)}
                              className="p-1 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg border-none cursor-pointer transition-all"
                              title="কানেকশন টেস্ট করুন"
                            >
                              <ExternalLink size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md">কানেকশন নেই</span>
                        )}
                      </td>

                      {/* Active/Inactive Switch */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`px-3 py-1 rounded-full text-[11px] font-black border cursor-pointer transition-all inline-flex items-center gap-1.5 ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                          <span>{item.isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border-none cursor-pointer transition-all"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteService(item)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border-none cursor-pointer transition-all"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Service Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 my-8 space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {editingItem ? 'সেবা তথ্য সম্পাদনা (Edit Service)' : 'নতুন ৬৩টি সেবা যোগ করুন (Add Service)'}
                    </h3>
                    <p className="text-xs font-bold text-slate-400">
                      পুঠিয়া উপজেলা ডিজিটাল প্ল্যাটফর্মের ক্যাটালগ এন্ট্রি
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 border-none cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
                {/* Order, Icon & Title */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">অর্ডার / পজিশন #</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={99}
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-center"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">আইকন (Emoji)</label>
                    <input
                      type="text"
                      required
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="যেমন: 🩺"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-center text-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-extrabold text-slate-700 mb-1">সেবার শিরোনাম (বাংলা)</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="যেমন: উপজেলা ই-নামজারি ও জমাভাগ"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                {/* Subtitle & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">সেবা ক্যাটাগরি (Category)</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-700"
                    >
                      {SERVICE_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">সংক্ষিপ্ত পরিচিতি (Subtitle)</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="যেমন: অনলাইনেই জমির খতিয়ান নামজারি ও ফি প্রদান"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                </div>

                {/* Time, Fee & Helpline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">প্রসেসিং সময় (Time)</label>
                    <input
                      type="text"
                      value={formData.processingTime}
                      onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                      placeholder="যেমন: ২৮ কর্মদিবস"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">ফি / খরচ (Fee)</label>
                    <input
                      type="text"
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                      placeholder="যেমন: ১,১৭০ টাকা"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">হেল্পলাইন / ফোন</label>
                    <input
                      type="text"
                      value={formData.helpline}
                      onChange={(e) => setFormData({ ...formData, helpline: e.target.value })}
                      placeholder="যেমন: 16122"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700"
                    />
                  </div>
                </div>

                {/* Department & Service Page Connection */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon size={16} className="text-indigo-600" />
                    <span className="font-black text-slate-800">সেবা পেজ কানেকশন (Service Page Connection)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-extrabold text-slate-600 mb-1">কানেকশন ধরণ (Type)</label>
                      <select
                        value={formData.connectionType}
                        onChange={(e: any) => setFormData({ ...formData, connectionType: e.target.value })}
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="internal">অভ্যন্তরীণ রুট (Internal Route)</option>
                        <option value="external">সরকারি বহিঃস্থ পোর্টাল (External Govt Link)</option>
                        <option value="form">আবেদন ফরম (App Form)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-600 mb-1">কানেক্টেড লিংক/রুট (URL Path)</label>
                      <input
                        type="text"
                        value={formData.connectedPageUrl}
                        onChange={(e) => setFormData({ ...formData, connectedPageUrl: e.target.value })}
                        placeholder="যেমন: /services/health অথবা https://..."
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-indigo-700"
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-600 mb-1">পেজ/বাটন লেবেল</label>
                      <input
                        type="text"
                        value={formData.connectedPageName}
                        onChange={(e) => setFormData({ ...formData, connectedPageName: e.target.value })}
                        placeholder="যেমন: ই-নামজারি পোর্টালে যান"
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">দায়িত্বপ্রাপ্ত দপ্তর / অফিস</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="যেমন: সহকারী কমিশনার (ভূমি) এর কার্যালয়, পুঠিয়া"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">বিস্তারিত নিয়মাবলী ও বিবরণ</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="সেবাটি পাওয়ার সুনির্দিষ্ট পদক্ষেপ, সময় ও নিয়মাবলী..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                {/* Status Switch */}
                <div className="pt-2 flex items-center justify-between bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span className="font-black text-slate-800">সেবা লাইভ স্ট্যাটাস (Active / Inactive)</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-extrabold text-emerald-800">
                      {formData.isActive ? 'সক্রিয় (Active Live)' : 'নিষ্ক্রিয় (Hidden Inactive)'}
                    </span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border-none cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-7 py-2.5 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white border-none cursor-pointer shadow-md flex items-center gap-2"
                  >
                    {isSaving && <RefreshCw size={14} className="animate-spin" />}
                    <span>{editingItem ? 'হালনাগাদ সেভ করুন' : 'সেবাটি যুক্ত করুন'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connection Test Preview Modal */}
      <AnimatePresence>
        {previewConnection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-sm">
                  <LinkIcon size={18} />
                  <span>সেবা পেজ কানেকশন টেস্ট</span>
                </div>
                <button
                  onClick={() => setPreviewConnection(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <p className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <span>{previewConnection.icon}</span>
                    <span>{previewConnection.title}</span>
                  </p>
                  <p className="text-slate-500 font-medium">{previewConnection.subtitle}</p>
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600">কানেক্টেড রুট Target:</p>
                  <p className="font-mono text-xs font-bold text-indigo-900 break-all">{previewConnection.connectedPageUrl}</p>
                  <p className="text-[11px] font-bold text-indigo-700">বাটন লেবেল: {previewConnection.connectedPageName}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setPreviewConnection(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border-none cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                <a
                  href={previewConnection.connectedPageUrl}
                  target={previewConnection.connectedPageUrl.startsWith('http') ? '_blank' : '_self'}
                  rel="noreferrer"
                  className="flex-1 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white text-center no-underline border-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>পেজে ভিজিট করুন</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, Video, FileText, HelpCircle, ChevronDown, ChevronUp, 
  CheckCircle, ExternalLink, PlayCircle, ListOrdered, DollarSign, Clock, MapPin, 
  ShieldCheck, Sparkles, Search, CheckCircle2, Award, PhoneCall, Copy,
  Smartphone, UserCheck, HeartHandshake, ShieldAlert, Heart, Truck, MessageSquareQuote,
  Gift, ShoppingBag, Landmark, BellRing, UserPlus, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { UnifiedHeroHeader } from '../../components/common/UnifiedDesignSystem';
import SEO from '../../components/SEO';

// @ts-ignore
import puthiaBg from "../../assets/images/puthia_temple_bg_1783616072369.jpg";

export interface ServiceGuide {
  id: string;
  title: string;
  category: 'account' | 'emergency' | 'citizen' | 'transport' | 'earn' | 'business' | 'app';
  categoryLabel: string;
  icon: string;
  cost: string;
  time: string;
  whereToApply: string;
  whereUrl: string;
  steps: { title: string; desc: string }[];
  documents: string[];
  faqs: { q: string; a: string }[];
  video: { title: string; duration: string; url: string };
}

const CATEGORIES = [
  { id: 'all', label: 'সব নির্দেশিকা', icon: BookOpen },
  { id: 'account', label: 'অ্যাকাউন্ট ও প্রোফাইল', icon: UserCheck },
  { id: 'emergency', label: 'জরুরি ও স্বাস্থ্য সেবা', icon: HeartHandshake },
  { id: 'citizen', label: 'নাগরিক সেবা ও অভিযোগ', icon: MessageSquareQuote },
  { id: 'transport', label: 'পরিবহন ও ভ্রমণ', icon: Truck },
  { id: 'earn', label: 'রেফার ও ইনকাম', icon: Gift },
  { id: 'business', label: 'বাজার ও উদ্যোক্তা', icon: ShoppingBag },
  { id: 'app', label: 'অ্যাপ ও নোটিশ', icon: Smartphone },
];

const SERVICE_GUIDES: ServiceGuide[] = [
  {
    id: 'puthia-account-guide',
    title: 'আমাদের পুঠিয়া ওয়েবসাইটে ফ্রি অ্যাকাউন্ট তৈরি ও প্রোফাইল সেটআপ নির্দেশিকা',
    category: 'account',
    categoryLabel: 'অ্যাকাউন্ট ও প্রোফাইল',
    icon: '👤',
    cost: 'সম্পূর্ণ বিনামূল্যে',
    time: '১ মিনিটে তাৎক্ষণিক সাইন আপ',
    whereToApply: 'আমাদের পুঠিয়া সাইডবার ড্রয়ার অথবা টপবার লগইন মেনু',
    whereUrl: '/login',
    steps: [
      { title: 'ধাপ ১: লগইন বা রেজিস্টার মেনু নির্বাচন', desc: 'ওয়েবসাইটের উপরের ডানপাশে থাকা ব্যবহারকারী আইকন অথবা বামপাশের সাইডবার মেনু থেকে "লগইন / রেজিস্টার" বাটনে ক্লিক করুন।' },
      { title: 'ধাপ ২: মোবাইল বা ইমেইল প্রদান', desc: 'আপনার সচল মোবাইল নম্বর অথবা ইমেইল অ্যাড্রেস দিন এবং একটি নিরাপদ পাসওয়ার্ড লিখুন।' },
      { title: 'ধাপ ৩: প্রোফাইল তথ্য ও এলাকা নির্বাচন', desc: 'আপনার পুরো নাম, পুঠিয়ার ইউনিয়ন ও গ্রামের নাম নির্বাচন করুন। সুন্দর একটি প্রোফাইল ছবি যুক্ত করতে পারেন।' },
      { title: 'ধাপ ৪: ড্যাশবোর্ড ও সব ফিচারে অ্যাক্সেস', desc: 'সফলভাবে রেজিস্ট্রেশনের পর আপনার নিজস্ব নাগরিক ড্যাশবোর্ড, রেফারাল ইনকাম কোড ও সকল অনলাইন সুবিধা সক্রিয় হয়ে যাবে।' }
    ],
    documents: [
      'সচল মোবাইল নম্বর বা ইমেইল ঠিকানা',
      'আপনার পূর্ণ নাম ও বর্তমান ঠিকানা (ইউনিয়ন ও গ্রাম)',
      'প্রোফাইল ছবি (ঐচ্ছিক)'
    ],
    faqs: [
      { q: 'অ্যাকাউন্ট না খুলে কি ওয়েবসাইটের তথ্য দেখা যাবে?', a: 'হ্যাঁ, ডাক্তার তালিকা, বাস শিডিউল ও জরুরি হটলাইন যে কেউ দেখতে পারবেন। তবে রেফার ও আয় এবং অভিযোগ জানাতে লগইন প্রয়োজন।' },
      { q: 'পাসওয়ার্ড ভুলে গেলে কীভাবে উদ্ধার করব?', a: 'লগইন পেজে গিয়ে "পাসওয়ার্ড ভুলে গেছেন?" অপশনে ক্লিক করে সহজেই পাসওয়ার্ড রিসেট করতে পারবেন।' }
    ],
    video: { title: 'আমাদের পুঠিয়া পোর্টালে ১ মিনিটে অ্যাকাউন্ট খোলার সহজ নিয়ম', duration: '২:১৫ মিনিট', url: '#' }
  },
  {
    id: 'emergency-services-guide',
    title: 'জরুরি সেবা ও ২৪/৭ হটলাইন (থানা পুলিশ, ফায়ার সার্ভিস ও অ্যাম্বুলেন্স)',
    category: 'emergency',
    categoryLabel: 'জরুরি ও স্বাস্থ্য সেবা',
    icon: '🚨',
    cost: 'সম্পূর্ণ ফ্রি তথ্য সেবা (৯৯৯ জাতীয় টোল-ফ্রি)',
    time: '১-ট্যাপে সরাসরি কল সংযোগ',
    whereToApply: 'আমাদের পুঠিয়া হোমস্ক্রিনের "জরুরি সেবা" ও "ডিজিটাল টুলস" মেনু',
    whereUrl: '/digital-tools',
    steps: [
      { title: 'ধাপ ১: জরুরি সেবা বাটনে ট্যাপ করুন', desc: 'হোমস্ক্রিনের উপরে থাকা লাল রঙের "জরুরি সেবা" বাটন অথবা ডিজিটাল টুলস থেকে জরুরি ডিরেক্টরিতে যান।' },
      { title: 'ধাপ ২: কাঙ্ক্ষিত দপ্তর নির্বাচন', desc: 'পুঠিয়া থানা ডিউটি অফিসার, পুঠিয়া ফায়ার সার্ভিস স্টেশন, উপজেলা স্বাস্থ্য কমপ্লেক্স কন্ট্রোল রুম বা জাতীয় জরুরি ৯৯৯ তালিকা থেকে আপনার প্রয়োজনটি বেছে নিন।' },
      { title: 'ধাপ ৩: ১-ক্লিকে সরাসরি কল দিন', desc: 'সবুজ "কল করুন" বাটনে চাপ দিলে আপনার মোবাইল ফোনের ডায়ালারে সরাসরি অফিশিয়াল নম্বরটি প্রস্তুত হয়ে যাবে।' },
      { title: 'ধাপ ৪: শান্তভাবে সহায়তা গ্রহণ করুন', desc: 'ডিউটি অফিসারকে আপনার পুঠিয়ার সঠিক লোকেশন ও ঘটনার বিবরণ স্পষ্ট করে জানান।' }
    ],
    documents: [
      'ঘটনাস্থলের সঠিক ঠিকানা ও পরিস্থিতি বিবরণ'
    ],
    faqs: [
      { q: 'পুঠিয়া ফায়ার সার্ভিসের নম্বর কি রাতেও খোলা থাকে?', a: 'হ্যাঁ, আমাদের পুঠিয়া পোর্টালে ফায়ার সার্ভিসের কন্ট্রোল রুমের ২৪ ঘণ্টা সার্বক্ষণিক সচল নম্বর যুক্ত রয়েছে।' },
      { q: 'কোনো ভুয়া কল দিলে কী হবে?', a: 'জরুরি নম্বরে অযথা কল করা শাস্তিযোগ্য অপরাধ। শুধুমাত্র প্রকৃত বিপদে কল করুন।' }
    ],
    video: { title: 'বিপদে ১-ট্যাপে পুঠিয়া থানা ও ফায়ার সার্ভিসের সঙ্গে যোগাযোগের উপায়', duration: '১:৩০ মিনিট', url: '#' }
  },
  {
    id: 'doctor-health-guide',
    title: 'বিশেষজ্ঞ ডাক্তার তালিকা, চেম্বার সময়সূচি ও সরাসরি সিরিয়াল দেওয়ার নিয়ম',
    category: 'emergency',
    categoryLabel: 'জরুরি ও স্বাস্থ্য সেবা',
    icon: '🩺',
    cost: 'তথ্য সেবা ফ্রি (ডাক্তারের ভিজিট ফি সরাসরি চেম্বারে প্রযোজ্য)',
    time: 'তাৎক্ষণিক শিডিউল যাচাই',
    whereToApply: 'আমাদের পুঠিয়া "ডাক্তার ও স্বাস্থ্য সেবা" ডিরেক্টরি',
    whereUrl: '/services/doctors',
    steps: [
      { title: 'ধাপ ১: স্বাস্থ্য ও ডাক্তার মেনু ওপেন করুন', desc: 'পোর্টালে "ডাক্তার তালিকা" আইকনে ক্লিক করে স্বাস্থ্য সেবা হাবটি খুলুন।' },
      { title: 'ধাপ ২: বিভাগ বা স্পেশালিটি নির্বাচন', desc: 'মেডিসিন, গাইনি ও প্রসূতি, শিশু বিশেষজ্ঞ, হৃদরোগ, অর্থোপেডিক ইত্যাদি বিভাগ অনুযায়ী ফিল্টার করুন।' },
      { title: 'ধাপ ৩: ডাক্তারের চেম্বার ও সময়সূচি চেক', desc: 'ডাক্তারের ডিগ্রি, পদবি, পুঠিয়ায় বসার দিন ও সময় এবং ভিজিট ফি দেখে নিন।' },
      { title: 'ধাপ ৪: সরাসরি চেম্বারে সিরিয়াল কল', desc: 'ডাক্তারের কার্ডে থাকা "সিরিয়াল দিন / কল করুন" বাটনে ক্লিক করে সহকারীর সাথে কথা বলে রোগীর নাম এন্ট্রি করুন।' }
    ],
    documents: [
      'রোগীর পুরো নাম ও বয়স',
      'পূর্ববর্তী প্রেসক্রিপশন ও মেডিকেল রিপোর্ট (যদি থাকে)'
    ],
    faqs: [
      { q: 'ডাক্তার সিরিয়ালের কোনো অগ্রিম টাকা পোর্টালে দিতে হবে কি?', a: 'না, আমাদের পুঠিয়া সম্পূর্ণ ফ্রিতে তথ্য ও সিরিয়াল নম্বর সরবরাহ করে। ভিজিট ফি শুধুমাত্র চেম্বারে গিয়ে পরিশোধ করবেন।' },
      { q: 'কোন কোন দিন কোন ডাক্তার বসেন তা কীভাবে জানব?', a: 'প্রতিটি ডাক্তারের প্রোফাইল কার্ডে বিস্তারিত বসার দিন ও সময় স্পষ্টভাবে উল্লেখ থাকে।' }
    ],
    video: { title: 'পুঠিয়ার অভিজ্ঞ ডাক্তারদের তালিকা দেখা ও সিরিয়াল নিশ্চিতের নিয়ম', duration: '২:৪৫ মিনিট', url: '#' }
  },
  {
    id: 'blood-donor-guide',
    title: 'জরুরি রক্তদাতা অনুসন্ধান ও নিজে রক্তদাতা হিসেবে নাম নিবন্ধন নির্দেশিকা',
    category: 'emergency',
    categoryLabel: 'জরুরি ও স্বাস্থ্য সেবা',
    icon: '🩸',
    cost: '১০০% নিঃস্বার্থ ও সম্পূর্ণ বিনামূল্যে',
    time: '১ মিনিটে রক্তদাতা খুঁজুন',
    whereToApply: 'আমাদের পুঠিয়া "রক্তদাতা / ব্লাড ব্যাংক" সেকশন',
    whereUrl: '/services/blood-donors',
    steps: [
      { title: 'ধাপ ১: রক্তদাতা মেনুতে প্রবেশ করুন', desc: 'হোমস্ক্রিনের "রক্তদাতা" অপশনে ক্লিক করে ব্লাড ব্যাংক হাবে যান।' },
      { title: 'ধাপ ২: রক্তের গ্রুপ ও ইউনিয়ন নির্বাচন', desc: 'আপনার প্রয়োজনীয় রক্তের গ্রুপ (A+, B+, O+, AB+, বা নেগেটিভ গ্রুপসমূহ) এবং পুঠিয়ার ইউনিয়ন সিলেক্ট করুন।' },
      { title: 'ধাপ ৩: রক্তদাতার সাথে সরাসরি যোগাযোগ', desc: 'ডোনারের নাম, গ্রাম ও শেষ রক্তদানের তারিখ দেখে "সরাসরি কল দিন" বাটনে চাপুন।' },
      { title: 'ধাপ ৪: নিজে রক্তদাতা হিসেবে যুক্ত হোন', desc: 'আপনি রক্তদান করতে আগ্রহী হলে "রক্তদাতা হিসেবে যুক্ত হোন" বাটনে চাপ দিয়ে নাম, গ্রুপ ও ফোন নম্বর দিয়ে ফর্ম পূরণ করুন।' }
    ],
    documents: [
      'সঠিক রক্তের গ্রুপ',
      'সর্বশেষ রক্তদানের তারিখ',
      'সচল মোবাইল নম্বর ও বর্তমান ঠিকানা'
    ],
    faqs: [
      { q: 'কত দিন পর পর একজন সুস্থ মানুষ রক্ত দিতে পারেন?', a: 'সাধারণত প্রতি ৩ থেকে ৪ মাস পর পর একজন সুস্থ প্রাপ্তবয়স্ক ব্যক্তি নিরাপদে রক্তদান করতে পারেন।' },
      { q: 'রক্তদাতার নম্বরে যোগাযোগে কি কোনো ফি লাগে?', a: 'একেবারেই না, পুঠিয়ার সকল রক্তদাতা মানবসেবায় নিঃস্বার্থভাবে রক্তদান করে থাকেন।' }
    ],
    video: { title: 'পুঠিয়ায় রক্তের প্রয়োজনে দ্রুত ডোনার খুঁজে পাওয়ার সম্পূর্ণ নিয়ম', duration: '৩:০০ মিনিট', url: '#' }
  },
  {
    id: 'complaint-grievance-guide',
    title: 'নাগরিক অভিযোগ ও পরামর্শ সেল—ইউপি চেয়ারম্যান ও মেয়রের নিকট সরাসরি আবেদন',
    category: 'citizen',
    categoryLabel: 'নাগরিক সেবা ও অভিযোগ',
    icon: '📝',
    cost: 'সম্পূর্ণ বিনামূল্যে',
    time: '২ মিনিটে অনলাইন সাবমিশন',
    whereToApply: 'আমাদের পুঠিয়া সাইডবার > অভিযোগ ও পরামর্শ সেল',
    whereUrl: '/complaints',
    steps: [
      { title: 'ধাপ ১: অভিযোগ পেজে যান', desc: 'বামপাশের সাইডবার মেনু থেকে "অভিযোগ ও পরামর্শ" বাটনে ক্লিক করুন।' },
      { title: 'ধাপ ২: এলাকা ও সমস্যার ধরন নির্বাচন', desc: 'আপনার ইউনিয়ন বা পৌর ওয়ার্ড নির্বাচন করুন এবং সমস্যার ক্যাটাগরি (রাস্তাঘাট, ড্রেনেজ, স্ট্রিট লাইট, বর্জ্য, দুর্নীতি, নিরাপত্তা) বেছে নিন।' },
      { title: 'ধাপ ৩: বিস্তারিত বিবরণ ও ছবি আপলোড', desc: 'সমস্যার বাস্তব চিত্র তুলে ধরে স্পষ্ট বিবরণ লিখুন এবং ঘটনাস্থলের ১-২টি প্রমাণ ছবি আপলোড করুন।' },
      { title: 'ধাপ ৪: ট্র্যাকিং কোড সংরক্ষণ ও অগ্রগতি', desc: 'আবেদন জমা দিলে একটি ট্র্যাকিং নম্বর পাবেন। প্রশাসন বা ইউপি কার্যালয় থেকে গৃহীত ব্যবস্থার আপডেট এখানে দেখতে পারবেন।' }
    ],
    documents: [
      'লগইন করা সক্রিয় একাউন্ট',
      'সমস্যার ছবি বা ডকুমেন্টারি প্রমাণ',
      'সঠিক লোকেশন ও বিবরণ'
    ],
    faqs: [
      { q: 'আমি কি পরিচয় গোপন রেখে অভিযোগ দিতে পারব?', a: 'হ্যাঁ, আপনি চাইলে নাম গোপন রেখে সাধারণ নাগরিক হিসেবে এলাকার জনগুরুত্বপূর্ণ সমস্যার কথা জানাতে পারবেন।' },
      { q: 'অভিযোগ জমা দেওয়ার পর কত দিনে ব্যবস্থা নেওয়া হয়?', a: 'সংশ্লিষ্ট ইউনিয়ন পরিষদ বা পৌরসভা অভিযোগ পাওয়ার পর সর্বোচ্চ ৩-৭ কার্যদিবসে প্রাথমিক তদন্ত চালায়।' }
    ],
    video: { title: 'পুঠিয়া নাগরিক পোর্টালে অনলাইন অভিযোগ জানানোর সহজ পদ্ধতি', duration: '২:৩০ মিনিট', url: '#' }
  },
  {
    id: 'bus-train-schedule-guide',
    title: 'বাস ও ট্রেন সময়সূচি এবং সরাসরি কাউন্টার বুকিং যোগাযোগ নির্দেশিকা',
    category: 'transport',
    categoryLabel: 'পরিবহন ও ভ্রমণ',
    icon: '🚌',
    cost: 'তথ্য দেখা ১০০% ফ্রি',
    time: 'তাৎক্ষণিক সময়সূচি ও ভাড়ার তালিকা',
    whereToApply: 'আমাদের পুঠিয়া "বাস ও পরিবহন" ডিরেক্টরি',
    whereUrl: '/services/transport',
    steps: [
      { title: 'ধাপ ১: পরিবহন মেনু ওপেন করুন', desc: 'হোমস্ক্রিন বা সার্ভিসেস ট্যাব থেকে "পরিবহন ও যোগাযোগ" অপশনটিতে ক্লিক করুন।' },
      { title: 'ধাপ ২: বাস সার্ভিস বা ট্রেন শিডিউল বাছাই', desc: 'পুঠিয়া ও বানেশ্বর থেকে ঢাকাগামী এসি/নন-এসি বাস বা রাজশাহী-ঢাকা রেলওয়ে শিডিউল নির্বাচন করুন।' },
      { title: 'ধাপ ৩: ভাড়া, সময় ও কাউন্টার লোকেশন যাচাই', desc: 'বাস ছাড়ার সময়, আসন ব্যবস্থা, ভাড়ার চার্ট এবং কাউন্টারে অবস্থানরত ম্যানেজারের ফোন নম্বর দেখুন।' },
      { title: 'ধাপ ৪: সরাসরি ফোন দিয়ে সিট বুকিং', desc: '"কাউন্টারে কল দিন" বাটনে চাপ দিয়ে অনায়াসে সিট নির্ধারণ বা বাসের আপডেট জেনে নিন।' }
    ],
    documents: [
      'ভ্রমণকারীর নাম ও যোগাযোগ নম্বর',
      'যাত্রার তারিখ ও পছন্দের আসন'
    ],
    faqs: [
      { q: 'বানেশ্বর ও পুঠিয়ার সকল বাস কাউন্টারের নম্বর কি এখানে আছে?', a: 'হ্যাঁ, দেশ ট্রাভেলস, ন্যাশনাল ট্রাভেলস, শ্যামলী, হানিফসহ সকল নিয়মিত বাসের হালনাগাদ কাউন্টার নম্বর সংযুক্ত আছে।' }
    ],
    video: { title: 'পুঠিয়া ও বানেশ্বর থেকে বাসের টিকিট ও সময়সূচি জানার উপায়', duration: '২:১৫ মিনিট', url: '#' }
  },
  {
    id: 'puthia-tourism-guide',
    title: 'পুঠিয়ার ঐতিহাসিক রাজবাড়ি, মন্দির ও দর্শনীয় স্থান ভ্রমণ গাইড',
    category: 'transport',
    categoryLabel: 'পরিবহন ও ভ্রমণ',
    icon: '🏰',
    cost: 'বিনামূল্যে গাইড ও ম্যাপ তথ্য',
    time: 'যেকোনো সময় দর্শনার্থী তথ্য',
    whereToApply: 'আমাদের পুঠিয়া "দর্শনীয় স্থান" পর্যটন হাব',
    whereUrl: '/places',
    steps: [
      { title: 'ধাপ ১: দর্শনীয় স্থান মেনুতে যান', desc: 'ওয়েবসাইটের "দর্শনীয় স্থান ও পর্যটন" অপশনে ক্লিক করুন।' },
      { title: 'ধাপ ২: মন্দির ও রাজবাড়ির ইতিহাস পড়ুন', desc: 'পঞ্চরত্ন গোবিন্দ মন্দির, শিব মন্দির, বড় রাজপ্রাসাদ, দোলমঞ্চ ও হাওয়াখানার ইতিহাস ও স্থাপত্যশৈলীর তথ্য জানুন।' },
      { title: 'ধাপ ৩: খোলার সময়সূচি ও প্রবেশ নিয়ম', desc: 'প্রত্নতত্ত্ব অধিদপ্তর কর্তৃক নির্ধারিত রাজবাড়ি খোলার দিন, সময় ও টিকিট ফি দেখে নিন।' },
      { title: 'ধাপ ৪: গুগল ম্যাপ লোকেশন ও হোটেল রেস্তোরাঁ', desc: 'পুঠিয়ায় পৌঁছানোর সহজ রুট, আশপাশের খাবারের দোকান ও আবাসিক হোটেলের সহায়তা গ্রহণ করুন।' }
    ],
    documents: [
      'প্রবেশের ক্ষেত্রে জাতীয় পরিচয়পত্র বা স্টুডেন্ট আইডি (প্রযোজ্য ক্ষেত্রে)'
    ],
    faqs: [
      { q: 'পুঠিয়া রাজবাড়ি সপ্তাহে কোন দিন বন্ধ থাকে?', a: 'সাধারণত রোববার সম্পূর্ণ ও সোমবার অর্ধদিবস সরকারি নিয়মে প্রত্নতত্ত্ব জাদুঘর বন্ধ থাকে; তবে বাইরের মন্দির প্রাঙ্গণ খোলা থাকে।' }
    ],
    video: { title: 'পুঠিয়ার প্রাচীন স্থাপত্য ও মন্দির ভ্রমণের সম্পূর্ণ দিকনির্দেশনা', duration: '৫:২০ মিনিট', url: '#' }
  },
  {
    id: 'referral-income-guide',
    title: 'রেফার ও ইনকাম প্রোগ্রাম—বন্ধুদের আমন্ত্রণ জানিয়ে নগদ পুরষ্কার অর্জন',
    category: 'earn',
    categoryLabel: 'রেফার ও ইনকাম',
    icon: '🎁',
    cost: 'বিনা পুঁজিতে ১০০% ফ্রি ইনকাম প্রোগ্রাম',
    time: 'তাৎক্ষণিক পয়েন্ট ক্রেডিট',
    whereToApply: 'আমাদের পুঠিয়া সাইডবার > "রেফার ও আয়" মেনু',
    whereUrl: '/referral',
    steps: [
      { title: 'ধাপ ১: রেফার ড্যাশবোর্ডে প্রবেশ করুন', desc: 'একাউন্টে লগইন করে সাইডবার মেনু থেকে "রেফার ও আয়" বাটনে ক্লিক করুন।' },
      { title: 'ধাপ ২: আপনার নিজস্ব রেফার লিঙ্ক কপি করুন', desc: 'স্ক্রিনে প্রদর্শিত আপনার ইউনিক রেফারাল কোড বা কপি লিঙ্ক বাটনে ট্যাপ করে লিঙ্কটি নিন।' },
      { title: 'ধাপ ৩: বন্ধুদের মাঝে শেয়ার করুন', desc: 'হোয়াটসঅ্যাপ, ফেসবুক বা মেসেঞ্জারে পুঠিয়ার বন্ধুদের লিঙ্কটি পাঠিয়ে সাইন আপ করতে বলুন।' },
      { title: 'ধাপ ৪: বিকাশ বা নগদে টাকা উত্তোলন', desc: 'নির্দিষ্ট পয়েন্ট জমা হলে উইথড্র অপশনে গিয়ে আপনার বিকাশ বা নগদ নম্বরে টাকা রিকোয়েস্ট পাঠান।' }
    ],
    documents: [
      'লগইন করা সক্রিয় একাউন্ট',
      'টাকা উত্তোলনের জন্য নিজস্ব বিকাশ বা নগদ একাউন্ট নম্বর'
    ],
    faqs: [
      { q: 'রেফার পয়েন্টের টাকা কত দিনে পাওয়া যায়?', a: 'উইথড্র রিকোয়েস্ট পাঠানোর পর অ্যাডমিন টিম ভেরিফিকেশন করে ১২-২৪ ঘণ্টার মধ্যে টাকা পাঠিয়ে দেয়।' },
      { q: 'রেফারে কোনো সীমা আছে কি?', a: 'না, আপনি যত খুশি বন্ধুদের আমন্ত্রণ জানিয়ে তত বেশি পয়েন্ট অর্জন করতে পারবেন।' }
    ],
    video: { title: 'আমাদের পুঠিয়া পোর্টালে বন্ধুদের রেফার করে আয় করার নিয়ম', duration: '৩:৩০ মিনিট', url: '#' }
  },
  {
    id: 'local-business-guide',
    title: 'স্থানীয় দোকান, আমের আড়ত ও উদ্যোক্তা ডিরেক্টরিতে ব্যবসা তালিকাভুক্তি',
    category: 'business',
    categoryLabel: 'বাজার ও উদ্যোক্তা',
    icon: '🛍️',
    cost: 'সম্পূর্ণ ফ্রি লিস্টিং সুবিধা',
    time: '১-২ কার্যদিবসে ভেরিফিকেশন',
    whereToApply: 'আমাদের পুঠিয়া "উদ্যোক্তা ও বাজার" ডিরেক্টরি',
    whereUrl: '/services/business',
    steps: [
      { title: 'ধাপ ১: ব্যবসা ডিরেক্টরিতে যান', desc: 'হোমস্ক্রিন থেকে "দোকানপাট ও উদ্যোক্তা" সেকশনটি ওপেন করুন।' },
      { title: 'ধাপ ২: "ব্যবসা যুক্ত করুন" ফর্মে ক্লিক', desc: 'পেজের উপরে থাকা "আপনার ব্যবসা যুক্ত করুন" বাটনে ক্লিক করে তথ্য ফরমটি পূরণ শুরু করুন।' },
      { title: 'ধাপ ৩: প্রতিষ্ঠানের বিবরণ ও যোগাযোগের তথ্য', desc: 'প্রতিষ্ঠানের নাম, ক্যাটাগরি (আমের আড়ত, মিষ্টির দোকান, ফার্মেসি, কাপড়ের দোকান ইত্যাদি), ঠিকানা ও মোবাইল নম্বর দিন।' },
      { title: 'ধাপ ৪: সাইনবোর্ড ও পণ্যের ছবি দিয়ে সাবমিট', desc: 'দোকানের স্পষ্ট ১-২টি ছবি আপলোড করে সাবমিট করুন। অ্যাডমিন অনুমোদনের পর হাজারো গ্রাহকের কাছে আপনার ব্যবসা পৌঁছে যাবে।' }
    ],
    documents: [
      'দোকান বা ব্যবসা প্রতিষ্ঠানের ছবি',
      'স্বত্বাধিকারীর নাম ও মোবাইল নম্বর',
      'প্রতিষ্ঠানের সুনির্দিষ্ট ঠিকানা (বাজার/গ্রাম)'
    ],
    faqs: [
      { q: 'আমের মৌসুমে বানেশ্বর হাটের চাষীরা কি পোস্ট দিতে পারবেন?', a: 'হ্যাঁ, বানেশ্বর হাটের আম চাষী ও আড়তদাররা সরাসরি তাদের তাজা আমের বিজ্ঞাপন ও ফোন নম্বর প্রচার করতে পারবেন।' }
    ],
    video: { title: 'আমাদের পুঠিয়া পোর্টালে আপনার নিজের দোকান বা সেবা ফ্রি রেজিস্টারের নিয়ম', duration: '৩:১৫ মিনিট', url: '#' }
  },
  {
    id: 'up-municipality-guide',
    title: 'ইউনিয়ন পরিষদ ও পৌরসভা প্রতিনিধি ও কর্মকর্তাদের যোগাযোগ নির্দেশিকা',
    category: 'citizen',
    categoryLabel: 'নাগরিক সেবা ও অভিযোগ',
    icon: '🏛️',
    cost: '১০০% বিনামূল্যে তথ্য সেবা',
    time: 'তাৎক্ষণিক যোগাযোগ',
    whereToApply: 'আমাদের পুঠিয়া "পৌরসভা ও ইউনিয়ন পরিষদ" হাব',
    whereUrl: '/services/unions',
    steps: [
      { title: 'ধাপ ১: পৌরসভা ও ইউনিয়ন মেনুতে ক্লিক করুন', desc: 'হোমস্ক্রিনের "নাগরিক সেবা ও স্থানীয় সরকার" আইকনে ক্লিক করুন।' },
      { title: 'ধাপ ২: ইউনিয়ন বা পৌরসভা নির্বাচন', desc: 'পুঠিয়া পৌরসভা অথবা ৬টি ইউনিয়ন (বেলপুকুর, বানেশ্বর, পুঠিয়া, ভালুকগাছি, জিউপাড়া, শিলমাড়িয়া) থেকে আপনার এলাকা বেছে নিন।' },
      { title: 'ধাপ ৩: চেয়ারম্যান, সচিব ও মেম্বারদের তালিকা', desc: 'নির্বাচিত চেয়ারম্যান, ইউপি সচিব, গ্রাম পুলিশ এবং সংশ্লিষ্ট ওয়ার্ড মেম্বারের অফিশিয়াল পদবি ও মোবাইল নম্বর দেখুন।' },
      { title: 'ধাপ ৪: নাগরিক সনদ ও সেবা গ্রহণে সরাসরি যোগাযোগ', desc: 'সরাসরি ফোনে কথা বলে নাগরিক সনদ, জন্মনিবন্ধন তথ্য বা ইউপি কার্যালয়ের সেবা সম্পর্কে পরামর্শ নিন।' }
    ],
    documents: [
      'প্রয়োজন সাপেক্ষে এনআইডি বা জন্মসনদের ফটোকপি'
    ],
    faqs: [
      { q: 'ইউনিয়ন পরিষদের মেম্বার ও সচিবদের ফোন নম্বর কি সঠিক?', a: 'হ্যাঁ, পুঠিয়া উপজেলা প্রশাসন ও স্থানীয় ইউনিয়ন পরিষদের অফিশিয়াল তালিকা থেকে সকল নম্বর নিয়মিত যাচাই করা হয়।' }
    ],
    video: { title: 'পুঠিয়ার সকল ইউনিয়ন পরিষদ ও জনপ্রতিনিধিদের সাথে যোগাযোগের নিয়ম', duration: '২:৪৫ মিনিট', url: '#' }
  },
  {
    id: 'app-install-guide',
    title: 'প্লে-স্টোর ছাড়াই মোবাইল হোমস্ক্রিনে "আমাদের পুঠিয়া" অ্যাপ ইনস্টল করার নিয়ম',
    category: 'app',
    categoryLabel: 'অ্যাপ ও নোটিশ',
    icon: '📲',
    cost: 'সম্পূর্ণ বিনামূল্যে',
    time: 'মাত্র ১০ সেকেন্ডে ইনস্টল',
    whereToApply: 'মোবাইল ক্রোম / সাফারি ব্রাউজার',
    whereUrl: '/app-download',
    steps: [
      { title: 'ধাপ ১: মোবাইল ব্রাউজারে সাইট খুলুন', desc: 'আপনার ফোনের গুগল ক্রোম বা সাফারি ব্রাউজারে আমাদের পুঠিয়া ওয়েবসাইটটি ওপেন করুন।' },
      { title: 'ধাপ ২: অ্যাপ ডাউনলোড বাটনে ক্লিক', desc: 'নিচের নোটিফিকেশন বার অথবা সাইডবার মেনুতে থাকা "অ্যাপ ডাউনলোড" অপশনে চাপ দিন।' },
      { title: 'ধাপ ৩: "Install" বা "Add to Home Screen" দিন', desc: 'ব্রাউজার পপ-আপে "Install" বা "Add to Home screen" চাপুন।' },
      { title: 'ধাপ ৪: হোমস্ক্রিন থেকে অ্যাপের মতো ব্যবহার', desc: 'আপনার মোবাইলের মূল স্ক্রিনে আমাদের পুঠিয়ার চমৎকার গোলাকার লোগো অ্যাপ হিসেবে যুক্ত হয়ে যাবে।' }
    ],
    documents: [
      'যেকোনো অ্যান্ড্রয়েড বা আইফোন স্মার্টফোন',
      'ইন্টারনেট সংযোগ'
    ],
    faqs: [
      { q: 'অ্যাপটি কি ফোনের বেশি মেমোরি খরচ করে?', a: 'না, এটি অত্যন্ত হালকা (মাত্র ২-৩ মেগাবাইট) এবং কোনো ব্যাকগ্রাউন্ড ব্যাটারি খরচ করে না।' },
      { q: 'অফলাইনে কি জরুরি তথ্য কাজ করবে?', a: 'হ্যাঁ, একবার ওপেন করার পর জরুরি হটলাইন ও দরকারি তথ্য ইন্টারনেট ছাড়াও দেখা যায়।' }
    ],
    video: { title: 'কীভাবে ১ ক্লিকে ফোনে আমাদের পুঠিয়া অ্যাপ ইনস্টল করবেন', duration: '১:১৫ মিনিট', url: '#' }
  },
  {
    id: 'notices-news-guide',
    title: 'উপজেলা জরুরি নোটিশ বোর্ড, চাকরির বিজ্ঞপ্তি ও স্থানীয় ঘোষণা পড়ার নিয়ম',
    category: 'app',
    categoryLabel: 'অ্যাপ ও নোটিশ',
    icon: '📢',
    cost: 'সম্পূর্ণ বিনামূল্যে',
    time: 'রিয়েল-টাইম আপডেট',
    whereToApply: 'আমাদের পুঠিয়া "নোটিশ ও জরুরি ঘোষণা" বোর্ড',
    whereUrl: '/notices',
    steps: [
      { title: 'ধাপ ১: নোটিশ বোর্ডে প্রবেশ করুন', desc: 'হোমপেজের চলমান নোটিশ স্ক্রলবার অথবা মেনু থেকে "নোটিশ ও ঘোষণা" নির্বাচন করুন।' },
      { title: 'ধাপ ২: উপজেলা ও সরকারি বিজ্ঞপ্তি যাচাই', desc: 'পুঠিয়া উপজেলার প্রশাসনিক সতর্কতা, বিদ্যুৎ বন্ধের শিডিউল, কৃষি পরামর্শ ও চাকরির নিয়োগ বিজ্ঞপ্তি পড়ুন।' },
      { title: 'ধাপ ৩: বিজ্ঞপ্তি ডাউনলোড বা শেয়ার', desc: 'প্রয়োজনীয় সার্কুলার বা প্রেস বিজ্ঞপ্তি পিডিএফ আকারে ডাউনলোড করে নিজের ফোনে সংরক্ষণ করুন।' },
      { title: 'ধাপ ৪: জরুরি সেবা সতর্কবার্তা পাওয়া', desc: 'উপজেলার যে কোনো জরুরি আবহাওয়া বা স্বাস্থ্য সতর্কতা সবার আগে পোর্টালে দেখে নিরাপদে থাকুন।' }
    ],
    documents: [
      'কোনো ডকুমেন্টের প্রয়োজন নেই'
    ],
    faqs: [
      { q: 'স্থানীয় কোনো সামাজিক উদ্যোগের নোটিশ প্রকাশ করা যাবে কি?', a: 'হ্যাঁ, রক্তদান কর্মসূচি বা সমাজকল্যাণমূলক ক্যাম্পেইনের নোটিশ সাইডবারের সাপোর্ট সেন্টারে জানালে বিনামূল্যে প্রকাশ করা হবে।' }
    ],
    video: { title: 'পুঠিয়া উপজেলার সকল নোটিশ ও সরকারি খবর সবার আগে জানার উপায়', duration: '১:৫০ মিনিট', url: '#' }
  }
];

export const GuidelinesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(SERVICE_GUIDES[0].id);
  const [activeTab, setActiveTab] = useState<'steps' | 'documents' | 'where' | 'faq' | 'video'>('steps');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredServices = SERVICE_GUIDES.filter(s => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.documents.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const currentService = SERVICE_GUIDES.find(s => s.id === selectedServiceId) || filteredServices[0] || SERVICE_GUIDES[0];

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('কপি করা হয়েছে!');
  };

  return (
    <div className="min-h-screen bg-[#fafcfb] flex flex-col font-sans select-none">
      <SEO 
        title="ওয়েবসাইট ব্যবহার নির্দেশিকা - আমাদের পুঠিয়া"
        description="আমাদের পুঠিয়া ওয়েবসাইট ব্যবহার নির্দেশিকা ও সকল সেবার নিয়মাবলী।"
      />

      <Header 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onSearch={(q) => setSearchQuery(q)} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(path) => {
          setIsSidebarOpen(false);
          navigate(path.startsWith('/') ? path : `/${path}`);
        }} 
      />

      {/* Full-width Standard Hero Header (Matching About Us and all other pages) */}
      <UnifiedHeroHeader
        title="ওয়েবসাইট ব্যবহার নির্দেশিকা"
        subtitle="ডাক্তার সিরিয়াল, রক্তদাতা সন্ধান, জরুরি থানা-ফায়ার সার্ভিস হটলাইন, বাস শিডিউল, রেফার ও ইনকাম, নাগরিক অভিযোগ দাখিলসহ আমাদের পুঠিয়া ওয়েবসাইটের প্রতিটি সেবা সহজে ব্যবহারের নিয়মাবলী জানুন।"
        badgeText="আমাদের পুঠিয়া পোর্টাল ব্যবহারের সম্পূর্ণ নিয়মাবলী"
        icon={<BookOpen size={24} />}
        showBack={true}
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
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-4 pb-40 relative z-10">
        
        {/* Search & Filter Section */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-sm border border-slate-200/80 mb-6 space-y-3.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আমাদের পুঠিয়ার যে কোনো সেবার নাম লিখে খুঁজুন (যেমন: ডাক্তার, রক্তদাতা, রেফার, অভিযোগ, বাস, অ্যাপ)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full cursor-pointer"
              >
                মুছুন
              </button>
            )}
          </div>

          {/* Category Chips Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isActive 
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70 border border-slate-200/60'
                  }`}
                >
                  <Icon size={15} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main 2-Column Desktop / Stacked Mobile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Guides List (4 Cols) */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                উপলব্ধ পুঠিয়া গাইডসমূহ ({filteredServices.length})
              </span>
              {selectedCategory !== 'all' && (
                <button 
                  onClick={() => setSelectedCategory('all')} 
                  className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  সব দেখুন
                </button>
              )}
            </div>

            {filteredServices.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/80 space-y-2 text-slate-500">
                <HelpCircle size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold">দুঃখিত! আপনার অনুসন্ধান অনুযায়ী কোনো গাইড খুঁজে পাওয়া যায়নি।</p>
              </div>
            ) : (
              filteredServices.map((service) => {
                const isSelected = service.id === currentService.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedServiceId(service.id);
                      setActiveTab('steps');
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl transition border cursor-pointer relative overflow-hidden ${
                      isSelected 
                        ? 'bg-emerald-900 text-white border-emerald-700 shadow-md shadow-emerald-950/20' 
                        : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0 leading-none pt-0.5">{service.icon}</span>
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                          isSelected ? 'bg-emerald-800 text-emerald-200 border border-emerald-600/40' : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                        }`}>
                          {service.categoryLabel}
                        </span>
                        <h3 className={`text-xs sm:text-sm font-black line-clamp-2 leading-snug ${
                          isSelected ? 'text-white' : 'text-slate-800'
                        }`}>
                          {service.title}
                        </h3>
                        <p className={`text-[11px] font-medium ${
                          isSelected ? 'text-emerald-200/90' : 'text-slate-500'
                        }`}>
                          সময়কাল: {service.time}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Active Guide Detailed Content (8 Cols) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              
              {/* Active Guide Card Header */}
              <div className="p-4 sm:p-6 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-b border-emerald-100/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 text-white rounded-full text-xs font-black">
                    <span>{currentService.icon}</span>
                    <span>{currentService.categoryLabel}</span>
                  </span>

                  <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                    আইডি: {currentService.id}
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                  {currentService.title}
                </h2>

                {/* Info Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="flex items-center gap-2 bg-white/90 p-2.5 rounded-xl border border-emerald-200/60 text-slate-700">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">খরচ / ফি:</span>
                      <span className="font-extrabold text-slate-800">{currentService.cost}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white/90 p-2.5 rounded-xl border border-emerald-200/60 text-slate-700">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">কার্যকর সময়কাল:</span>
                      <span className="font-extrabold text-slate-800">{currentService.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Navigation Tabs */}
              <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50/70 p-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'steps', label: 'ধাপসমূহ', icon: ListOrdered },
                  { id: 'documents', label: 'প্রয়োজনীয় তথ্য', icon: FileText },
                  { id: 'where', label: 'ব্যবহারের স্থান', icon: MapPin },
                  { id: 'faq', label: 'প্রশ্ন ও উত্তর', icon: HelpCircle },
                  { id: 'video', label: 'ভিডিও গাইড', icon: Video }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive 
                          ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <Icon size={15} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Body Content */}
              <div className="p-4 sm:p-6 min-h-[320px]">
                <AnimatePresence mode="wait">
                  
                  {/* 1. Steps Tab */}
                  {activeTab === 'steps' && (
                    <motion.div
                      key="steps"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                          <ListOrdered className="w-4 h-4 text-emerald-600" />
                          <span>ধাপে ধাপে ব্যবহারের নিয়মাবলী</span>
                        </h3>
                        <span className="text-[11px] font-bold text-slate-400">
                          মোট {currentService.steps.length} টি ধাপ
                        </span>
                      </div>

                      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-emerald-100">
                        {currentService.steps.map((step, idx) => (
                          <div key={idx} className="relative flex items-start gap-3.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
                            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs z-10">
                              {idx + 1}
                            </span>
                            <div className="space-y-1">
                              <h4 className="text-xs sm:text-sm font-black text-slate-900">{step.title}</h4>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed">{step.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* 2. Documents Tab */}
                  {activeTab === 'documents' && (
                    <motion.div
                      key="documents"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span>প্রয়োজনীয় তথ্য ও প্রস্তুতি</span>
                        </h3>
                        <span className="text-[11px] font-bold text-emerald-700">
                          প্রস্তুত রাখুন
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {currentService.documents.map((doc, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200/60 text-xs sm:text-sm font-bold text-slate-800 hover:bg-emerald-100/50 transition group"
                          >
                            <div className="flex items-center gap-2.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{doc}</span>
                            </div>
                            <button
                              onClick={() => handleCopyText(doc)}
                              className="text-slate-400 hover:text-emerald-700 p-1 rounded-lg transition cursor-pointer"
                              title="কপি করুন"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-medium flex items-start gap-2">
                        <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>পরামর্শ: আমাদের পুঠিয়া প্ল্যাটফর্মের সকল সাধারণ তথ্য সেবা ও হটলাইন বিনামূল্যে জনগণের জন্য উন্মুক্ত।</span>
                      </div>
                    </motion.div>
                  )}

                  {/* 3. Where to Apply Tab */}
                  {activeTab === 'where' && (
                    <motion.div
                      key="where"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span>সেবা ব্যবহারের পেইজ ও অবস্থান</span>
                        </h3>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">প্ল্যাটফর্ম অবস্থান:</span>
                          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                            {currentService.whereToApply}
                          </p>
                        </div>
                      </div>

                      {currentService.whereUrl && currentService.whereUrl !== '#' && (
                        <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl shadow-lg space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-300">
                              ওয়েবসাইট সরাসরি লিংক
                            </span>
                            <h4 className="text-sm sm:text-base font-black text-white">
                              সরাসরি এই সেবা পেইজে যেতে নিচের বাটনে ক্লিক করুন
                            </h4>
                          </div>

                          <button
                            onClick={() => navigate(currentService.whereUrl)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition transform active:scale-95 cursor-pointer"
                          >
                            <span>সরাসরি সেবা পেইজে যান</span>
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 4. FAQ Tab */}
                  {activeTab === 'faq' && (
                    <motion.div
                      key="faq"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-3">
                        <HelpCircle className="w-4 h-4 text-emerald-600" />
                        <span>সাধারণ জিজ্ঞাসা ও সমাধান</span>
                      </h3>

                      {currentService.faqs.map((faq, idx) => (
                        <div key={idx} className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50">
                          <button
                            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                            className="w-full text-left p-3.5 flex items-center justify-between font-bold text-slate-800 text-xs sm:text-sm cursor-pointer hover:bg-slate-100/70"
                          >
                            <span>{faq.q}</span>
                            {openFaq === idx ? <ChevronUp size={16} className="text-emerald-700 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                          </button>
                          {openFaq === idx && (
                            <div className="p-3.5 pt-0 text-xs text-slate-600 font-medium bg-white border-t border-slate-100 leading-relaxed">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* 5. Video Tutorial Tab */}
                  {activeTab === 'video' && (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                        <Video className="w-4 h-4 text-emerald-600" />
                        <span>ভিডিও গাইডলাইন ও ব্যবহারের টিউটোরিয়াল</span>
                      </h3>

                      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white text-center relative overflow-hidden shadow-2xl flex flex-col items-center justify-center space-y-4">
                        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${puthiaBg})` }} />
                        <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl relative z-10 cursor-pointer hover:scale-110 transition">
                          <PlayCircle size={32} />
                        </div>
                        <div className="relative z-10 space-y-1">
                          <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                            সময়কাল: {currentService.video.duration}
                          </span>
                          <h4 className="text-sm sm:text-base font-black text-white">{currentService.video.title}</h4>
                        </div>
                        <p className="text-xs text-slate-300 relative z-10 max-w-md">
                          আমাদের পুঠিয়া ওয়েবসাইটের এই ফিচারটির ব্যবহার পদ্ধতি ধাপে ধাপে দেখতে প্লে বাটনে ক্লিক করুন।
                        </p>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>

      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default GuidelinesPage;

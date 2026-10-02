import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Info, Sprout, Target, Eye, 
  Building2, UserCheck, Heart, GraduationCap, Briefcase, 
  Hotel, Newspaper, Megaphone, Camera, ShoppingBag, 
  PhoneCall, CheckCircle2, Lock, TrendingUp, Star, 
  Lightbulb, Users, HeartHandshake, Code, FileEdit, 
  Calendar, MapPin, Mail, Globe, Facebook, Youtube, 
  MessageSquare, ChevronDown, ChevronUp, History, 
  Flag, Award, Clock, Sparkles, Send, ShieldAlert,
  User, Check, AlertCircle, Bookmark, Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { db, auth } from "../../firebase";
import { collection, addDoc, getDocs, orderBy, query, limit } from "firebase/firestore";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import BottomNavigation from "../../components/home/BottomNavigation";
import { UnifiedHeroHeader } from "../../components/common/UnifiedDesignSystem";
import SEO from "../../components/SEO";

// Statistics Counter Data
const STATS = [
  { label: "নিবন্ধিত ব্যবহারকারী", count: "১২,৫০০+", icon: Users, color: "from-emerald-500 to-green-600" },
  { label: "সেবাদাতা প্রতিষ্ঠান", count: "৪৫০+", icon: Building2, color: "from-teal-500 to-emerald-600" },
  { label: "তথ্যভান্ডার", count: "৮,২০০+", icon: Info, color: "from-green-500 to-emerald-700" },
  { label: "ঐতিহাসিক ছবি", count: "১,৫০০+", icon: Camera, color: "from-teal-600 to-green-500" },
  { label: "ভিডিও চিত্র", count: "৩৫০+", icon: Youtube, color: "from-emerald-600 to-teal-500" },
  { label: "গুরুত্বপূর্ণ নোটিশ", count: "৬০০+", icon: Megaphone, color: "from-green-600 to-emerald-500" },
  { label: "বিজ্ঞাপন ও কেনাবেচা", count: "১,২০০+", icon: ShoppingBag, color: "from-teal-500 to-green-600" },
];

// Provided Services list with navigation paths
const SERVICES = [
  { label: "উপজেলা তথ্য", path: "/upazila-intro", icon: Building2, desc: "পুঠিয়া উপজেলার সামগ্রিক পরিচিতি ও তথ্য।" },
  { label: "নাগরিক সেবা", path: "/services", icon: UserCheck, desc: "অনলাইন আবেদন, সনদপত্র ও সরকারি সেবা।" },
  { label: "স্বাস্থ্যসেবা", path: "/health", icon: Heart, desc: "ডাক্তার, হাসপাতাল ও ডায়াগনস্টিক তথ্য।" },
  { label: "শিক্ষা ও লাইব্রেরি", path: "/education", icon: GraduationCap, desc: "স্কুল, কলেজ, মাদ্রাসা ও পড়ার সুযোগ।" },
  { label: "কৃষি সেবা", path: "/agriculture", icon: Sprout, desc: "ফসল, বাজারদর ও কৃষি কর্মকর্তাদের পরামর্শ।" },
  { label: "ব্যবসায়িক ডিরেক্টরি", path: "/business", icon: Briefcase, desc: "পুঠিয়ার স্থানীয় ব্যবসা ও উদ্যোক্তাদের তথ্য।" },
  { label: "দর্শনীয় স্থান ও পর্যটন", path: "/tourism", icon: Hotel, desc: "রাজবাড়ি, মন্দির ও ঐতিহাসিক স্থানের ভ্রমণ গাইড।" },
  { label: "পাবলিক নোটিশ", path: "/notice", icon: Megaphone, desc: "জরুরি নোটিশ, সার্কুলার ও সরকারি ঘোষণা।" },
  { label: "খবর ও সংবাদ", path: "/news", icon: Newspaper, desc: "পুঠিয়ার প্রতিদিনের তাজা খবর ও খবরাখবর।" },
  { label: "ফটোগ্রাফি ও ছবি গ্যালারি", path: "/photo-gallery", icon: Camera, desc: "পুঠিয়ার ঐতিহাসিক রূপ ও দৃশ্যপট।" },
  { label: "বাজার ও কেনা-বেচা", path: "/marketplace", icon: ShoppingBag, desc: "পণ্য ক্রয়-বিক্রয় ও স্থানীয় হাট।" },
  { label: "জরুরি হটলাইন সেবা", path: "/emergency", icon: PhoneCall, desc: "ফায়ার সার্ভিস, police ও অ্যাম্বুলেন্স নম্বর।" },
];

// Why Choose Us Checklist
const WHY_US = [
  "এক প্ল্যাটফর্মে সব তথ্য",
  "দ্রুত অনুসন্ধান সুবিধা",
  "সব ধরণের মোবাইল-বান্ধব",
  "নিয়মিত ও নির্ভরযোগ্য আপডেট",
  "নিরাপদ ও ব্যক্তিগত তথ্য সুরক্ষা",
  "সম্পূর্ণ বাংলা ভাষায় সেবা",
];

// Core Values
const VALUES = [
  { title: "স্বচ্ছতা", desc: "আমরা নির্ভুল ও যাচাইকৃত তথ্য সবার মাঝে উন্মুক্ত ও স্বচ্ছ রাখতে প্রতিশ্রুতিবদ্ধ।", icon: Eye },
  { title: "সেবার মান", desc: "নাগরিক ও দর্শনার্থীদের সর্বোচ্চ মানের নিরবচ্ছিন্ন সেবা প্রদানে আমরা সদা সচেষ্ট।", icon: Star },
  { title: "উদ্ভাবন", desc: "সহজতর নাগরিক জীবন গড়ে তুলতে আমরা আধুনিক প্রযুক্তির নিত্যনতুন উদ্ভাবন ব্যবহার করি।", icon: Lightbulb },
  { title: "অংশগ্রহণ", desc: "স্থানীয় বাসিন্দা এবং সেবাদাতাদের সক্রিয় সংযোগ ও মিথস্ক্রিয়া আমাদের মূল চালিকাশক্তি।", icon: Users },
  { title: "নিরাপত্তা", desc: "ব্যবহারকারী ও উদ্যোক্তাদের সকল তথ্য সুরক্ষিত ও নিরাপদ রাখতে আধুনিক এনক্রিপশন ব্যবহার করা হয়।", icon: Lock },
  { title: "ধারাবাহিক উন্নয়ন", desc: "ফিডব্যাক এবং পরিবর্তনের সাথে তাল মিলিয়ে প্ল্যাটফর্মটিকে আমরা প্রতিনিয়ত আধুনিকায়ন করি।", icon: TrendingUp },
];

// Core Activities
const ACTIVITIES = [
  "পুঠিয়ার প্রতিটি গ্রাম ও ইউনিয়ন থেকে নির্ভরযোগ্য ডাটা ও তথ্য সংগ্রহ করা।",
  "অফিশিয়াল সোর্স এবং স্থানীয় প্রশাসনের মাধ্যমে সংগৃহীত তথ্যের শতভাগ সত্যতা নিশ্চিত করা।",
  "জরুরি রক্তদান, এ্যাম্বুলেন্স, ফায়ার সার্ভিস এবং ডাক্তারদের কন্টাক্ট নম্বর প্রতিনিয়ত সচল রাখা।",
  "ক্ষুদ্র ও মাঝারি ব্যবসায়ীদের পণ্য ছড়িয়ে দিতে ডিজিটাল বিজ্ঞাপন এবং ফ্রি ডিরেক্টরি প্রদান।",
  "যেকোনো জরুরি পরিস্থিতিতে দ্রুত নাগরিক মতামত সংগ্রহ এবং অভিযোগ বা ফিডব্যাক ট্র্যাকিং।",
  "ডিজিটাল বাংলাদেশ ও স্মার্ট পুঠিয়া গড়তে গ্রামীণ নাগরিকদের প্রযুক্তি ব্যবহারে উৎসাহ দেওয়া।",
];

// Our Team Cards
const TEAM = [
  { name: "মুহাম্মদ জোসিম উদ্দিন", role: "Founder", desc: "পুঠিয়া উপজেলার উন্নয়নে ডিজিটাল রূপান্তরের স্বপ্নদ্রষ্টা ও উদ্যোক্তা।", initial: "M", bg: "bg-emerald-600 text-white" },
  { name: "মোঃ সবুজ আহমেদ", role: "Project Lead", desc: "পরিকল্পনা বাস্তবায়ন, সমন্বয় সাধন ও তথ্য যাচাইকরণ দলের প্রধান সমন্বয়ক।", initial: "S", bg: "bg-teal-600 text-white" },
  { name: "নিলয় রহমান", role: "Developer", desc: "আধুনিক রিয়্যাক্ট ও ফায়ারবেস প্রযুক্তির মাধ্যমে প্ল্যাটফর্মটির সফটওয়্যার আর্কিটেক্ট।", initial: "N", bg: "bg-emerald-700 text-white" },
  { name: "সারমিন সুলতানা", role: "Content Team", desc: "পুঠিয়ার ইতিহাস, ঐতিহ্য ও দর্শনীয় স্থানের নির্ভরযোগ্য কনটেন্ট রাইটার ও এডিটর।", initial: "S", bg: "bg-green-600 text-white" },
  { name: "পুঠিয়া ভলান্টিয়ার টিম", role: "Volunteer Team", desc: "মাঠ পর্যায় থেকে সার্বক্ষণিক তথ্য সংগ্রহকারী ও সমাজসেবী তরুণ-তরুণীদের সমন্বিত দল।", initial: "V", bg: "bg-teal-700 text-white" },
];

// Accordion FAQs
const FAQS = [
  {
    q: "আমাদের পুঠিয়া কী?",
    a: '"আমাদের পুঠিয়া" একটি অলাভজনক নাগরিক সেবামূলক ডিজিটাল তথ্য ও সেবা প্ল্যাটফর্ম। রাজশাহীর পুঠিয়া উপজেলার সাধারণ নাগরিক, দর্শনার্থী, শিক্ষার্থী, প্রবাসী ও ব্যবসায়ীদের জরুরি নাগরিক সেবা, শিক্ষা, স্বাস্থ্য, কৃষি ও ঐতিহ্যবাহী তথ্য এক জায়গায় প্রদান করাই এই প্ল্যাটফর্মের মূল লক্ষ্য।'
  },
  {
    q: "তথ্য কীভাবে যুক্ত করব?",
    a: "আমাদের প্ল্যাটফর্মে তথ্য যুক্ত করা খুবই সহজ! আপনি নাগরিক একাউন্ট তৈরি করে আপনার নিজের ব্যবসা, পণ্য বা বাসা ভাড়ার বিজ্ঞাপন বিনামূল্যে যুক্ত করতে পারেন। অন্যান্য প্রয়োজনীয় তথ্য যেমন রক্তদাতা তালিকা, এ্যাম্বুলেন্স তথ্য বা স্থানীয় প্রতিষ্ঠানের তথ্য যুক্ত করতে ড্যাশবোর্ড থেকে সংশ্লিষ্ট ফর্মে সাবমিট করুন।"
  },
  {
    q: "ভুল তথ্য কীভাবে জানাব?",
    a: "কোনো তথ্যে অসঙ্গতি বা ভুল থাকলে সরাসরি আমাদের মেইলে যোগাযোগ করতে পারেন অথবা প্রতিটি তথ্যের পাশে থাকা 'রিপোর্ট' বাটনে ক্লিক করে সঠিক বিবরণী লিখে পাঠাতে পারেন। আমাদের এডিটর প্যানেল ২৪ ঘণ্টার মধ্যে তথ্যটি যাচাই করে সংশোধন করবে।"
  },
  {
    q: "কিভাবে যোগাযোগ করব?",
    a: "আমাদের সাথে যোগাযোগ করতে আমাদের কন্টাক্ট ফর্ম পূরণ করতে পারেন অথবা সরাসরি support@puthia.gov.bd ইমেইলে লিখতে পারেন। এছাড়াও জরুরি প্রয়োজনে আমাদের কন্টাক্ট নম্বরে কল করতে পারেন অথবা পুঠিয়া রাজবাড়ির পাশে অবস্থিত আমাদের তথ্য কেন্দ্রে সরাসরি যোগাযোগ করতে পারেন।"
  }
];

// Timeline Project History
const TIMELINE = [
  { year: "২০২৪ (মার্চ)", title: "পরিকল্পনা ও স্বপ্নযাত্রা", desc: "পুঠিয়া উপজেলার প্রত্যন্ত অঞ্চলের মানুষের কাছে সেবা ও সঠিক তথ্য সহজে পৌঁছে দেওয়ার লক্ষ্য নিয়ে প্ল্যাটফর্মটির পরিকল্পনা গ্রহণ করা হয়।", details: "মার্চ মাসের এক কনকনে বিকেলে পুঠিয়ার সাধারণ মানুষের সাথে কফি আড্ডায় প্রথম এই আইডিয়াটি মাথায় আসে। ডিজিটাল বাংলাদেশের অগ্রযাত্রায় পুঠিয়া কেন পিছিয়ে থাকবে?", icon: History },
  { year: "২০২৪ (মে)", title: "প্রাথমিক ডিজাইন ও উন্নয়ন", desc: "আধুনিক ইউজার ইন্টারফেস এবং সম্পূর্ণ বাংলায় নাগরিক-বান্ধব ডিজাইন লেআউট প্রস্তুতকরণ সমাপ্ত হয়।", details: "টানা ২ মাসের নিরলস পরিশ্রমে সম্পূর্ণ কাস্টম ডিজাইন আর্কিটেকচার চূড়ান্ত করা হয় যেন এটি সব বয়সের ব্যবহারকারীর জন্য সহজবোধ্য হয়樣子।", icon: Lightbulb },
  { year: "২০২৪ (আগস্ট)", title: "নাগরিক সেবা ও ব্লাড ডোনার চালু", desc: "অনলাইন রক্তদান ও গ্রহণ নেটওয়ার্ক এবং জরুরি যোগাযোগ নম্বর যুক্ত করে প্রথম লাইভ ডেমো ভার্সন অবমুক্ত করা হয়।", details: "প্রথম দিনেই ৫০ জনেরও বেশি স্থানীয় তরুণ রক্তদাতা হিসেবে নিবন্ধন করে এবং প্রথম সপ্তাহে ৩ জন মুমূর্ষু রোগীকে রক্ত দিয়ে সাহায্য করা সম্ভব হয়।", icon: Heart },
  { year: "২০২৫ (জানুয়ারি)", title: "ব্যবসায়িক ডিরেক্টরি ও মার্কেটপ্লেস সংযোগ", desc: "পুঠিয়ার শত শত স্থানীয় ব্যবসায়ী এবং ক্ষুদ্র উদ্যোক্তাদের যুক্ত করে কেনাবেচা মার্কেটপ্লেস ও ডিরেক্টরি সফলভাবে যোগ করা হয়।", details: "পুঠিয়ার বিখ্যাত গুড় ও আমের পাইকারি ব্যবসায়ীরা এই মার্কেটপ্লেসের সাহায্যে সরাসরি ভোক্তাদের সাথে সংযোগ স্থাপন করতে সক্ষম হন।", icon: ShoppingBag },
  { year: "২০২৬ (বর্তমান)", title: "স্মার্ট পুঠিয়া রূপান্তর", desc: "হাজার হাজার নিবন্ধিত নাগরিকের অংশগ্রহণ, জিও-ম্যাপ ইন্টিগ্রেশন এবং সমৃদ্ধ তথ্যভান্ডার সহ পুঠিয়ার প্রধান অফিশিয়াল অনলাইন গেটওয়েতে পরিণত হওয়া।", details: "বর্তমানে আমাদের এই প্ল্যাটফর্মে ১২,৫০০-এর বেশি নাগরিক নিয়মিত যুক্ত আছেন এবং তথ্যভান্ডারে রয়েছে পুঠিয়ার প্রতিটি কোণার খুঁটিনাটি।", icon: Award }
];

// Achievements list
const ACHIEVEMENTS = [
  { title: "সেরা স্থানীয় আইটি উদ্যোগ ২০২৪", desc: "রাজশাহী বিভাগের অন্যতম সেরা স্থানীয় জনকল্যাণমুখী ডিজিটাল উদ্যোগ হিসেবে বিশেষ সম্মাননা ও প্রশংসাপত্র লাভ।", icon: TrophyIcon, year: "২০২৪" },
  { title: "১০০% ভেরিফাইড ব্লাড ডোনার", desc: "পুঠিয়া অঞ্চলের প্রায় ৮০০+ সক্রিয় ও পরীক্ষিত রক্তদাতার বৃহৎ ডিজিটাল পরিবার গড়ে তোলার গৌরব।", icon: HeartIcon, year: "২০২৫" },
  { title: "ডিজিটাল কমার্স প্রসার এওয়ার্ড", desc: "স্থানীয় ক্ষুদ্র উদ্যোক্তা ও কুটির শিল্পের উদ্যোক্তাদের বিনামূল্যে অনলাইন প্রচারণায় অনন্য অবদানের স্বীকৃতি।", icon: Award, year: "২০২৫" },
  { title: "স্মার্ট নাগরিক তথ্যভান্ডার মাইলফলক", desc: "পুঠিয়া উপজেলার ৯৫% স্কুল, কলেজ, ডাক্তার ও ঐতিহাসিক প্রতিষ্ঠানের শতভাগ সঠিক তথ্য সফলভাবে ডিজিটাল আর্কাইভে সংরক্ষণ।", icon: Flag, year: "২০২৬" }
];

// Our Special Suggestions / আমার বিশেষ পরামর্শ
const SUGGESTIONS = [
  { title: "তথ্যের সঠিকতা নিশ্চিত করুন", desc: "যেকোনো জরুরি যোগাযোগের নম্বর বা তথ্য ব্যবহারের পূর্বে অনুগ্রহ করে যাচাই করে নিন। আমরা নিয়মিত আপডেট করলেও মাঠপর্যায়ে তথ্য পরিবর্তন হতে পারে।", icon: CheckCircle2 },
  { title: "নিরাপদ লেনদেন বজায় রাখুন", desc: "বিজ্ঞাপন ও কেনাবেচা মার্কেটপ্লেস মডিউলে পণ্য কেনার সময় সরাসরি দেখে এবং টাকা দেওয়ার আগে শতভাগ নিশ্চিত হয়ে নিন। অনলাইন লেনদেনে সর্বদা সতর্ক থাকুন।", icon: ShieldAlert },
  { title: "অংশগ্রহণ ও শেয়ারিং", desc: "আপনার পরিচিত কোনো ডাক্তার, রক্তদাতা বা ব্যবসা প্রতিষ্ঠান থাকলে আমাদের ড্যাশবোর্ডে গিয়ে সেটি যুক্ত করুন। তথ্য ছড়িয়ে দেওয়াও একটি সামাজিক দায়িত্ব।", icon: Share2 }
];

// Fallback user testimonials
const DEFAULT_TESTIMONIALS = [
  { name: "তাহসিন উল্লাহ", role: "শিক্ষক, পুঠিয়া সরকারি কলেজ", feedback: "আমাদের পুঠিয়া ওয়েবসাইটের কারণে এখন উপজেলার যেকোনো জরুরি ব্লাড ডোনার বা এ্যাম্বুলেন্স সহজে পাওয়া যায়। এটি সত্যি চমৎকার একটি যুগান্তকারী নাগরিক উদ্যোগ!", rating: 5, date: "১০ জুলাই, ২০২৬" },
  { name: "মোছাঃ ফাতেমা খাতুন", role: "গৃহিণী ও ক্ষুদ্র উদ্যোক্তা", feedback: "আমি আমার বাড়িতে তৈরি কুটির শিল্পের পণ্য আমাদের মার্কেটপ্লেসে দেওয়ার পর অনেক অর্ডার পেয়েছি। কোনো চার্জ ছাড়া এমন সুন্দর বিজ্ঞাপনের সুবিধা সত্যিই ধারণাতীত!", rating: 5, date: "০৫ জুলাই, ২০২৬" },
  { name: "ডাঃ এস. কে. রায়", role: "হৃদরোগ বিশেষজ্ঞ", feedback: "ডাক্তারদের শিডিউল ও চেম্বারের কন্টাক্ট নম্বর এক জায়গায় থাকা সাধারণ রোগীদের জন্য অসীম কল্যাণ বয়ে এনেছে। প্রযুক্তির সঠিক ব্যবহার একেই বলে!", rating: 5, date: "০১ জুলাই, ২০২৬" }
];

// Custom local Icons for achievements
function TrophyIcon(props: any) {
  return <Award className="text-amber-500" {...props} />;
}
function HeartIcon(props: any) {
  return <Heart className="text-red-500 fill-red-500" {...props} />;
}

const AboutUsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState<number>(4); // Default to current milestone

  // Form states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [sending, setSending] = useState(false);

  // Volunteer/Partners integration modal or state
  const [activeJoinTab, setActiveJoinTab] = useState<"volunteer" | "provider" | "donor">("volunteer");
  const [joinName, setJoinName] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinDetails, setJoinDetails] = useState("");
  const [joining, setJoining] = useState(false);

  // Dynamic feedback loaded from Firebase Firestore
  const [dbFeedbacks, setDbFeedbacks] = useState<any[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  // Fetch feedbacks from Firestore
  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const q = query(
        collection(db, "citizen_feedbacks"), 
        orderBy("createdAt", "desc"), 
        limit(6)
      );
      const snap = await getDocs(q);
      const items = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDbFeedbacks(items);
    } catch (e) {
      console.error("Error fetching feedbacks from firestore:", e);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Submit Feedback / Opinion to firestore
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactMessage.trim()) {
      toast.error("দয়া করে নাম ও মতামত সঠিকভাবে পূরণ করুন");
      return;
    }
    setSending(true);
    try {
      const currentUser = auth.currentUser;
      const feedbackPayload = {
        userId: currentUser?.uid || "anonymous",
        userName: contactName.trim(),
        userEmail: contactEmail.trim() || "not-provided",
        rating: feedbackRating,
        feedback: contactMessage.trim(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "citizen_feedbacks"), feedbackPayload);
      
      toast.success("আপনার মূল্যবান মতামতের জন্য ধন্যবাদ! এটি সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে।");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      setFeedbackRating(5);
      
      // Refresh feedbacks
      fetchFeedbacks();
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      toast.error("মতামত জমা দেওয়া যায়নি। পুনরায় চেষ্টা করুন।");
    } finally {
      setSending(false);
    }
  };

  // Submit Join Call to Action Application to firestore
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim() || !joinPhone.trim()) {
      toast.error("দয়া করে নাম ও মোবাইল নম্বর সঠিকভাবে প্রদান করুন");
      return;
    }
    setJoining(true);
    try {
      await addDoc(collection(db, "join_applications"), {
        name: joinName.trim(),
        phone: joinPhone.trim(),
        type: activeJoinTab,
        details: joinDetails.trim() || "no-details",
        createdAt: new Date().toISOString()
      });
      toast.success("আপনার আবেদনটি সফলভাবে নিবন্ধিত হয়েছে! আমাদের টিম আপনার সাথে শীঘ্রই যোগাযোগ করবে।");
      setJoinName("");
      setJoinPhone("");
      setJoinDetails("");
    } catch (err) {
      console.error("Error submitting join application:", err);
      toast.error("আবেদন প্রক্রিয়াকরণ করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setJoining(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-slate-50 relative text-slate-800"
    >
      <SEO 
        title="আমাদের সম্পর্কে - আমাদের পুঠিয়া | ডিজিটাল তথ্য ও সেবা প্ল্যাটফর্ম"
        description="আমাদের পুঠিয়া — প্রযুক্তির মাধ্যমে পুঠিয়ার তথ্য, সেবা ও মানুষের সংযোগের একটি আধুনিক ডিজিটাল প্ল্যাটফর্ম।"
      />

      {/* Background radial matrix accent */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #059669 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

      {/* Header Bar */}
      <Header />

      {/* Full-width Standard Hero Header (Matching all other pages in the app) */}
      <UnifiedHeroHeader
        title="আমাদের পুঠিয়া"
        subtitle="প্রযুক্তির মাধ্যমে পুঠিয়ার তথ্য, সেবা ও মানুষের সংযোগের একটি আধুনিক ডিজিটাল প্ল্যাটফর্ম"
        badgeText="ডিজিটাল প্ল্যাটফর্ম"
        icon={<Info size={24} />}
        showBack={true}
        rightAction={
          <button
            type="button"
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              toast.success("লিংক শেয়ারের জন্য কপি করা হয়েছে!");
            }}
            className="py-1.5 px-3 bg-white hover:bg-emerald-50 text-[#006a4e] text-xs font-black rounded-xl flex items-center gap-1 shadow-md border-none cursor-pointer transition-all active:scale-95"
          >
            <Share2 size={15} className="text-[#006a4e] stroke-[2.5]" />
            <span>শেয়ার করুন</span>
          </button>
        }
      />

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-40 space-y-12 relative z-10">

        {/* 2. Core Introduction Section */}
        <motion.section 
          variants={itemVariants} 
          className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch"
        >
          {/* Introduction Text Card */}
          <div className="md:col-span-7 bg-white p-6 md:p-8 rounded-[20px] border border-emerald-100/50 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                পরিচিতি
              </span>
              <h3 className="text-xl md:text-2xl font-black text-emerald-950 leading-snug">
                আমাদের পুঠিয়া কী?
              </h3>
              <p className="text-gray-600 font-medium text-sm leading-relaxed md:text-base">
                <strong>"আমাদের পুঠিয়া"</strong> একটি অলাভজনক ডিজিটাল তথ্য ও সেবা প্ল্যাটফর্ম, যার লক্ষ্য পুঠিয়া উপজেলার নাগরিক, প্রবাসী, শিক্ষার্থী, ব্যবসায়ী ও দর্শনার্থীদের জন্য নির্ভরযোগ্য তথ্য ও প্রয়োজনীয় সেবা এক জায়গায় সহজলভ্য করা।
              </p>
              <p className="text-gray-500 text-xs font-medium leading-relaxed">
                প্রযুক্তির যুগে একটি তথ্যসমৃদ্ধ এবং সুন্দর নাগরিক পরিবেশ গড়ে তুলতে আমরা স্থানীয় প্রশাসন, তরুণ স্বেচ্ছাসেবক এবং সেবাদাতাদের সম্মিলিত শক্তিতে এই তথ্যভাণ্ডার নিয়মিত সচল ও আপডেট রাখছি।
              </p>
            </div>
          </div>

          {/* 4. Our Vision Card */}
          <div className="md:col-span-5 bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 md:p-8 rounded-[20px] text-white shadow-xl flex flex-col justify-between border-4 border-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-700/20 rounded-full blur-3xl"></div>
            <div className="space-y-4 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 bg-emerald-800/60 px-3 py-1 rounded-lg inline-block">
                দূরदर्शी লক্ষ্য
              </span>
              <h3 className="text-xl font-black flex items-center gap-2">
                <Target size={22} className="text-emerald-400" />
                আমাদের ভিশন (Vision)
              </h3>
              <p className="text-emerald-50 text-base md:text-lg font-black leading-relaxed italic border-l-4 border-emerald-400 pl-4 py-2">
                "প্রযুক্তিনির্ভর, তথ্যসমৃদ্ধ ও সেবাবান্ধব একটি স্মার্ট পুঠিয়া গড়ে তোলা।"
              </p>
            </div>
            <div className="text-[11px] font-bold text-emerald-300 pt-6 relative z-10">
              © স্মার্ট বাংলাদেশ ভিশন ২০৪১ এর অংশীদার
            </div>
          </div>
        </motion.section>

        {/* 3. Our Mission Grid Section */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
              আমাদের লক্ষ্য
            </span>
            <h3 className="text-2xl font-black text-emerald-950">আমাদের লক্ষ্য (Mission)</h3>
            <p className="text-xs font-bold text-gray-400">সহজ ডিজিটাল সমাধান ও নাগরিক জীবন সহজীকরণের সুনির্দিষ্ট লক্ষ্য</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { title: "নির্ভরযোগ্য তথ্য প্রদান", desc: "নাগরিকদের জন্য সঠিক, নির্ভুল ও যাচাইকৃত তথ্য সরবরাহ করা।", icon: CheckCircle2 },
              { title: "ডিজিটাল সেবা সহজ করা", desc: "জরুরি সেবা, ফর্ম ও ডিরেক্টরি হাতের মুঠোয় নিয়ে আসা।", icon: Lightbulb },
              { title: "স্থানীয় ব্যবসায়ীদের সহায়তা", desc: "ক্ষুদ্র ও মাঝারি উদ্যোক্তাদের জন্য ফ্রি ডিরেক্টরি ও কেনাবেচা সুযোগ দেওয়া।", icon: Briefcase },
              { title: "পর্যটন ও ঐতিহ্য প্রচার", desc: "পুঠিয়ার সমৃদ্ধ ইতিহাস ও ঐতিহাসিক মন্দিরগুলো বিশ্বদরবারে তুলে ধরা।", icon: Hotel },
              { title: "শিক্ষা ও স্বাস্থ্য সহজলভ্য করা", desc: "ডাক্তার, লাইব্রেরি ও শিক্ষা প্রতিষ্ঠানের তথ্য দ্রুত ও সহজে মেলানো।", icon: Heart },
              { title: "স্মার্ট পুঠিয়া গড়ে তোলা", desc: "নাগরিক ও প্রশাসনের মাঝে মেলবন্ধন ঘটিয়ে একটি স্বনির্ভর ডিজিটাল উপজেলা তৈরি।", icon: Sprout }
            ].map((mission, i) => (
              <div key={i} className="bg-white p-5 rounded-[20px] border border-emerald-100/40 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                    <mission.icon size={18} />
                  </div>
                  <h4 className="font-extrabold text-sm text-emerald-950">{mission.title}</h4>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed font-semibold">{mission.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Premium: Achievements Section (🏆 অর্জিত মাইলফলক) */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-lg">
              আমাদের গৌরব ও সফলতা
            </span>
            <h3 className="text-2xl font-black text-emerald-950">আমাদের অর্জন (Achievements)</h3>
            <p className="text-xs font-bold text-gray-400">পুঠিয়ার নাগরিক সেবায় আমরা যেসকল মাইলফলক অর্জন করেছি</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ACHIEVEMENTS.map((ach, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white to-slate-50/50 p-6 rounded-[24px] border border-slate-100 shadow-sm flex gap-4 relative overflow-hidden group hover:shadow-md hover:border-emerald-200 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
                <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 h-fit w-fit shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <ach.icon size={24} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded">
                      {ach.year}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 tracking-wider">মাইলফলক</span>
                  </div>
                  <h4 className="font-black text-slate-800 text-sm leading-tight">
                    {ach.title}
                  </h4>
                  <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                    {ach.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5. What We Offer (আমরা কী কী সেবা দিই) - Active Interactive Cards */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
              ডিজিটাল সেবা
            </span>
            <h3 className="text-2xl font-black text-emerald-950">আমরা কী কী সেবা দিই</h3>
            <p className="text-xs font-bold text-gray-400">নিচের যেকোনো সেবার কার্ডে ক্লিক করে সরাসরি সেই ফিচারে চলে যান</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SERVICES.map((service, i) => (
              <button
                key={i}
                onClick={() => {
                  navigate(service.path);
                  toast.success(`'${service.label}' মডিউলে আপনাকে স্বাগত!`);
                }}
                className="bg-white p-4 rounded-[20px] border border-slate-100 text-left hover:border-emerald-300 hover:shadow-lg transition-all group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
                <div className="p-2.5 bg-slate-50 text-emerald-700 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 mb-3">
                  <service.icon size={18} />
                </div>
                <h4 className="font-extrabold text-xs text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">
                  {service.label}
                </h4>
                <p className="text-gray-400 text-[10px] leading-relaxed font-bold block">
                  {service.desc}
                </p>
              </button>
            ))}
          </div>
        </motion.section>

        {/* 10. Achievements & Statistics Counters */}
        <motion.section 
          variants={itemVariants} 
          className="bg-emerald-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl border-4 border-white"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 opacity-90"></div>
          <div className="relative z-10 space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 bg-emerald-800/80 px-3 py-1 rounded-lg inline-block">
                আমাদের অগ্রগতি
              </span>
              <h3 className="text-2xl font-black">আমাদের পরিসংখ্যান</h3>
              <p className="text-xs font-bold text-emerald-200/80">পুঠিয়ার নাগরিক ডিজিটাল সংযোগের ক্রমাগত সাফল্যের পরিসংখ্যান</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
              {STATS.map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-[20px] text-center border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="w-8 h-8 mx-auto bg-emerald-500/20 text-emerald-300 rounded-full flex items-center justify-center mb-2">
                    <stat.icon size={16} />
                  </div>
                  <h4 className="text-2xl font-black text-emerald-100 leading-none mb-1">
                    {stat.count}
                  </h4>
                  <p className="text-xs font-bold text-emerald-200">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Premium: Interactive Project Timeline */}
        <motion.section variants={itemVariants} className="bg-white p-6 md:p-8 rounded-[24px] border border-emerald-100/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600"><Clock size={20}/></span> 
              <div>
                <h3 className="text-lg md:text-xl font-black text-emerald-950">📅 আমাদের ইন্টারেক্টিভ টাইমলাইন</h3>
                <p className="text-xs font-bold text-gray-400">পুঠিয়া প্ল্যাটফর্মের শুরু থেকে বর্তমান পর্যন্ত গুরুত্বপূর্ণ মাইলফলক</p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg">
              যেকোনো বছর স্পর্শ করুন
            </span>
          </div>

          {/* Interactive Timeline Row */}
          <div className="grid grid-cols-5 gap-2 relative before:absolute before:top-6 before:left-6 before:right-6 before:h-0.5 before:bg-slate-100 before:z-0 mb-8">
            {TIMELINE.map((item, idx) => {
              const isSelected = selectedTimelineIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedTimelineIndex(idx)}
                  className="flex flex-col items-center text-center relative z-10 focus:outline-none cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-full border-4 ${isSelected ? "border-emerald-600 bg-white text-emerald-700 shadow-md scale-110" : "border-white bg-slate-100 text-slate-450 group-hover:bg-emerald-50 group-hover:text-emerald-700"} flex items-center justify-center transition-all duration-300 shrink-0`}>
                    <item.icon size={16} />
                  </div>
                  <span className={`text-[10px] font-black mt-2 transition-colors ${isSelected ? "text-emerald-700 font-extrabold" : "text-slate-500"}`}>
                    {item.year.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Display Details of Selected Timeline Item */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedTimelineIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-50 rounded-[20px] p-5 border border-slate-150 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 text-emerald-200/50">
                <Sparkles size={48} />
              </div>
              <div className="max-w-2xl space-y-2">
                <span className="inline-block px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                  {TIMELINE[selectedTimelineIndex].year}
                </span>
                <h4 className="text-base font-black text-emerald-950">
                  {TIMELINE[selectedTimelineIndex].title}
                </h4>
                <p className="text-slate-700 text-xs sm:text-sm font-semibold leading-relaxed">
                  {TIMELINE[selectedTimelineIndex].desc}
                </p>
                <p className="text-slate-500 text-xs italic leading-relaxed pt-2 border-t border-slate-200/50">
                  💡 {TIMELINE[selectedTimelineIndex].details}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* 6 & 7 & 8: Why Us, Values, Activities Layout Adaptation */}
        <motion.section 
          variants={itemVariants} 
          className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in"
        >
          {/* Why Us Card (6 cols) */}
          <div className="md:col-span-6 bg-white p-6 md:p-8 rounded-[20px] border border-emerald-100/50 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg inline-block">
                কেন আমরা শ্রেষ্ঠ?
              </span>
              <h3 className="text-lg md:text-xl font-black text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 size={18} className="text-emerald-600" />
                কেন আমাদের পুঠিয়া?
              </h3>
              <div className="grid grid-cols-1 gap-3 pt-2">
                {WHY_US.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activities Card (6 cols) */}
          <div className="md:col-span-6 bg-white p-6 md:p-8 rounded-[20px] border border-emerald-100/50 shadow-sm">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg inline-block">
                কার্যক্রম
              </span>
              <h3 className="text-lg md:text-xl font-black text-emerald-950 flex items-center gap-1.5">
                <TrendingUp size={18} className="text-emerald-600" />
                আমাদের কার্যক্রম
              </h3>
              <ul className="space-y-2.5 pt-2 text-xs font-semibold text-slate-600 leading-relaxed list-decimal list-inside pl-1">
                {ACTIVITIES.map((activity, idx) => (
                  <li key={idx} className="marker:text-emerald-700 marker:font-black">
                    <span className="text-slate-700">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* 7. Our Values Section */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
              আমাদের আদর্শ ও বিশ্বাস
            </span>
            <h3 className="text-2xl font-black text-emerald-950">আমাদের মূল্যবোধ</h3>
            <p className="text-xs font-bold text-gray-400">স্বচ্ছ ও কল্যাণমুখী উপজেলা গঠনে আমরা যেসব মূলনীতি কঠোরভাবে মেনে চলি</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((val, i) => (
              <div key={i} className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit h-fit shrink-0">
                  <val.icon size={20} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-sm text-emerald-950">{val.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed font-semibold">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Dynamic: Citizens & Users Testimonials (💬 ব্যবহারকারীদের মতামত) */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-750 bg-emerald-50 px-3 py-1 rounded-lg">
              নাগরিক মিথস্ক্রিয়া
            </span>
            <h3 className="text-2xl font-black text-emerald-950">💬 ব্যবহারকারীদের মতামত ও মূল্যায়ন</h3>
            <p className="text-xs font-bold text-gray-400">আমাদের সুশীল সমাজ ও সম্মানিত ব্যবহারকারীদের বাস্তব অভিজ্ঞতা</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Real DB Feedbacks Combined with Default High-Quality Testimonials */}
            {loadingFeedbacks ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center space-y-2">
                <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                <p className="text-xs font-bold text-slate-500">মতামত লোড হচ্ছে...</p>
              </div>
            ) : (
              [...dbFeedbacks, ...DEFAULT_TESTIMONIALS].slice(0, 6).map((item, idx) => {
                const initial = item.name ? item.name[0] : "C";
                return (
                  <div key={idx} className="bg-white p-6 rounded-[24px] border border-slate-150 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
                    <span className="absolute top-4 right-6 text-emerald-100/40 text-4xl font-black pointer-events-none group-hover:scale-110 transition-transform">“</span>
                    <div className="space-y-3 relative z-10">
                      {/* Rating Stars */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <Star 
                            key={starVal} 
                            size={14} 
                            className={`${starVal <= (item.rating || 5) ? "text-emerald-500 fill-amber-400" : "text-slate-200"}`} 
                          />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                        {item.feedback}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-100 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-sm flex items-center justify-center uppercase shadow-sm">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 truncate">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 block truncate">
                          {item.role || "সম্মানিত নাগরিক"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.section>

        {/* Premium: "আমাদের সাথে যুক্ত হোন" Call-to-Action (❤️ Connect / Join Us) */}
        <motion.section variants={itemVariants} className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-6 md:p-8 rounded-[32px] border border-emerald-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Info and tabs selector */}
            <div className="md:col-span-7 space-y-4">
              <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-wider inline-block">
                ❤️ আমাদের সাথে যুক্ত হোন
              </span>
              <h3 className="text-xl md:text-2xl font-black text-emerald-950">পুঠিয়ার উন্নয়নে আপনার হাত বাড়ান</h3>
              <p className="text-xs md:text-sm font-semibold text-slate-650 leading-relaxed">
                আপনার একটুখানি অবদান পুঠিয়া উপজেলার হাজারো মানুষকে সঠিক সেবা পেতে সাহায্য করতে পারে। নিচের যেকোনো একটি মাধ্যমে আজই যুক্ত হতে আবেদন করুন:
              </p>

              {/* Dynamic tabs */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { id: "volunteer", label: "স্বেচ্ছাসেবী হিসেবে", icon: HeartHandshake },
                  { id: "provider", label: "সেবাদাতা বা পার্টনার", icon: Building2 },
                  { id: "donor", label: "রক্তদাতা হিসেবে", icon: Heart }
                ].map((tab) => {
                  const isActive = activeJoinTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveJoinTab(tab.id as any);
                        setJoinDetails("");
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${isActive ? "bg-emerald-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic instruction description */}
              <div className="bg-white/80 p-4 rounded-2xl text-xs font-semibold text-slate-600 leading-relaxed border border-emerald-100/50">
                {activeJoinTab === "volunteer" && (
                  <p>🌟 <strong>স্বেচ্ছাসেবী:</strong> নতুন তথ্য সংগ্রহ করা, ব্লাড ডোনার এবং ডাক্তারদের শিডিউল ভেরিফিকেশন করা, মাঠপর্যায়ে তথ্য যাচাই করা এবং স্থানীয়ভাবে ওয়েবসাইটটির প্রচার করা স্বেচ্ছাসেবকদের প্রধান দায়িত্ব।</p>
                )}
                {activeJoinTab === "provider" && (
                  <p>🏥 <strong>সেবাদাতা/উদ্যোক্তা:</strong> আপনি যদি কোনো ক্লিনিক, লাইব্রেরি, ব্যবসা প্রতিষ্ঠান বা কোচিং সেন্টারের মালিক হয়ে থাকেন, তবে আপনার তথ্য সম্পূর্ণ বিনামূল্যে ওয়েবসাইটে যোগ করে নিতে পারবেন।</p>
                )}
                {activeJoinTab === "donor" && (
                  <p>🩸 <strong>রক্তদাতা:</strong> পুঠিয়ার মুমূর্ষু রোগীদের জরুরি রক্তের প্রয়োজনে আপনাকে সরাসরি যোগাযোগ করা হতে পারে। রক্তদান মহৎ ও শ্রেষ্ঠ সামাজিক কাজ!</p>
                )}
              </div>
            </div>

            {/* Quick action form */}
            <form onSubmit={handleJoinSubmit} className="md:col-span-5 bg-white p-5 rounded-[24px] border border-slate-150 shadow-md space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">দ্রুত আবেদন ফর্ম</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 block">আপনার নাম:</label>
                <input 
                  type="text" 
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="যেমন: মোঃ আসাদ" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 block">মোবাইল নম্বর:</label>
                <input 
                  type="tel" 
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  placeholder="যেমন: ০১৭০০০০০০০০" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 block">সংক্ষিপ্ত বিবরণ / অভিজ্ঞতা:</label>
                <textarea 
                  value={joinDetails}
                  onChange={(e) => setJoinDetails(e.target.value)}
                  placeholder="যেমন: কেন যোগ দিতে চান বা কোন ইউনিয়নের রক্তদাতা..." 
                  className="w-full h-16 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={joining}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                {joining ? "প্রক্রিয়াধীন..." : "যোগ দিতে আবেদন করুন"}
              </button>
            </form>
          </div>
        </motion.section>

        {/* 9. Our Team Section (Founder, Project Lead, Developer, Volunteer Team, etc) */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
              আমাদের টিম ও চালিকাশক্তি
            </span>
            <h3 className="text-2xl font-black text-emerald-950">আমাদের টিম</h3>
            <p className="text-xs font-bold text-gray-400">এই স্বপ্নীল প্ল্যাটফর্ম সচল রাখতে যারা পর্দার আড়াল থেকে নিয়মিত পরিশ্রম করছেন</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {TEAM.map((member, i) => (
              <div key={i} className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className={`w-14 h-14 mx-auto rounded-full ${member.bg} flex items-center justify-center font-black text-xl shadow-md uppercase group-hover:scale-105 transition-transform duration-300`}>
                    {member.initial}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                      {member.name}
                    </h4>
                    <span className="inline-block text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-1">
                      {member.role}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[10px] leading-relaxed font-bold">
                    {member.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Premium: "💡 আমার বিশেষ পরামর্শ" Section */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
              বিশেষ গাইডলাইন
            </span>
            <h3 className="text-2xl font-black text-emerald-950">💡 আমার বিশেষ পরামর্শ ও উদ্যোগ</h3>
            <p className="text-xs font-bold text-gray-400">পুঠিয়ার নাগরিক সুবিধা নিরাপদে ও কার্যকরভাবে ব্যবহারের জন্য নির্দেশনা</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUGGESTIONS.map((sug, i) => (
              <div key={i} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit">
                    <sug.icon size={20} />
                  </div>
                  <h4 className="font-black text-sm text-slate-800">
                    {sug.title}
                  </h4>
                  <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                    {sug.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 11 & 12. Contact us & Map & Follow Us Grid */}
        <motion.section 
          variants={itemVariants} 
          className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch"
        >
          {/* Contact details & Map (7 cols) */}
          <div className="md:col-span-7 bg-white p-6 md:p-8 rounded-[20px] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <span className="bg-emerald-50 p-2 rounded-xl text-emerald-600"><PhoneCall size={18}/></span>
                <div>
                  <h3 className="font-black text-emerald-950 text-base">আমাদের সাথে যোগাযোগ</h3>
                  <p className="text-[10px] font-bold text-gray-400">যেকোনো মতামত, পরামর্শ বা অনুসন্ধানের জন্য কন্টাক্ট করুন</p>
                </div>
              </div>

              {/* Direct address elements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                <div className="flex gap-2.5 items-start">
                  <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">কার্যালয়:</span>
                    <span>পুঠিয়া রাজবাড়ি রোড, পুঠিয়া, রাজশাহী</span>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <Mail size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">ইমেইল:</span>
                    <a href="mailto:info@puthia.gov.bd" className="hover:text-emerald-700 transition-colors">info@puthia.gov.bd</a>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <PhoneCall size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">মোবাইল নম্বর:</span>
                    <a href="tel:+8801700000000" className="hover:text-emerald-700 transition-colors">+৮৮০ ১৭০০-০০০০০০</a>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <Globe size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">অফিশিয়াল ওয়েবসাইট:</span>
                    <a href="https://www.amaderputhia.com" target="_blank" rel="noreferrer" className="hover:text-emerald-700 transition-colors">www.amaderputhia.com</a>
                  </div>
                </div>
              </div>

              {/* Follow Us element */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  📱 ফলো করুন আমাদের সোশ্যাল চ্যানেল:
                </span>
                <div className="flex gap-2">
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl transition-all flex items-center gap-1.5 text-[11px] font-black"
                  >
                    <Facebook size={14} /> ফেসবুক
                  </a>
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 bg-[#FF0000] hover:bg-[#E60000] text-white rounded-xl transition-all flex items-center gap-1.5 text-[11px] font-black"
                  >
                    <Youtube size={14} /> ইউটিউব
                  </a>
                  <a 
                    href="https://whatsapp.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl transition-all flex items-center gap-1.5 text-[11px] font-black"
                  >
                    <MessageSquare size={14} /> হোয়াটসঅ্যাপ
                  </a>
                </div>
              </div>
            </div>

            {/* Google Map Iframe wrapper */}
            <div className="mt-5 rounded-2xl overflow-hidden border border-slate-200 h-40">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14539.99616055531!2d88.8268579!3d24.3639148!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fc1729b6748dbb%3A0xc6cb5a6ea861a7a2!2sPuthia%20Upazila!5e0!3m2!1sen!2sbd!4v1711234567890!5m2!1sen!2sbd" 
                className="w-full h-full border-0" 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Contact Message & Rating Feedback Form (5 cols) - Fully Interactive and Functional */}
          <div className="md:col-span-5 bg-white p-6 md:p-8 rounded-[20px] border border-slate-100 shadow-sm flex flex-col justify-between">
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg inline-block">
                📩 মতামত ও ফিডব্যাক ফর্ম
              </span>
              <h3 className="font-black text-slate-800 text-base">আপনার মূল্যবান পরামর্শ দিন</h3>

              {/* Rating Star Selection */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-500 block">আপনার রেটিং বা মূল্যায়ন:</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isHighlighted = starVal <= (hoverRating || feedbackRating);
                    return (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setFeedbackRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform active:scale-125 cursor-pointer"
                        title={`${starVal} স্টার`}
                      >
                        <Star 
                          className={`w-7 h-7 transition-all ${isHighlighted ? "text-emerald-500 fill-amber-400 drop-shadow-sm" : "text-slate-200"}`} 
                        />
                      </button>
                    );
                  })}
                  <span className="text-[11px] font-black text-emerald-800 ml-2">
                    {feedbackRating === 5 ? "অসাধারণ!" : feedbackRating === 4 ? "খুব ভালো!" : feedbackRating === 3 ? "চলবে" : feedbackRating === 2 ? "পরিমার্জন প্রয়োজন" : "উন্নয়ন আবশ্যক"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-500 block">আপনার নাম:</label>
                <input 
                  type="text" 
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="সম্পূর্ণ নামটি লিখুন" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-500 block">ইমেইল ঠিকানা (ঐচ্ছিক):</label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="যেমন: name@example.com" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-500 block">আপনার গঠনমূলক মতামত/পরামর্শ:</label>
                <textarea 
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="পুঠিয়া প্ল্যাটফর্ম সম্পর্কে আপনার অনুভূতি ও পরামর্শ বিস্তারিত লিখুন..." 
                  className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all resize-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={sending}
                className="w-full py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send size={14} />
                {sending ? "পাঠানো হচ্ছে..." : "মতামত জমা দিন"}
              </button>
            </form>
          </div>
        </motion.section>

        {/* 13. FAQ Section with Accordion Expand */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
              জিজ্ঞাসা ও উত্তর
            </span>
            <h3 className="text-2xl font-black text-emerald-950">সাধারণ জিজ্ঞাসা (FAQ)</h3>
            <p className="text-xs font-bold text-gray-400">আমাদের পুঠিয়া প্ল্যাটফর্ম সম্পর্কে সাধারণ কিছু প্রশ্ন ও তার স্পষ্ট উত্তর</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div key={i} className="bg-white rounded-[20px] border border-slate-200/60 overflow-hidden shadow-sm hover:border-slate-300 transition-all">
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-xs sm:text-sm text-slate-800 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">?</span>
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp size={16} className="text-emerald-600 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-slate-100 bg-slate-50/50"
                      >
                        <p className="p-5 text-xs sm:text-sm leading-relaxed font-semibold text-slate-600">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* 14. Inspiring and Motivational Closing Quote card from the User */}
        <motion.section 
          variants={itemVariants}
          className="relative bg-gradient-to-br from-emerald-800 to-green-950 text-white p-8 md:p-12 rounded-[32px] border-4 border-white shadow-2xl text-center overflow-hidden"
        >
          {/* Decorative ambient background shapes */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="w-16 h-16 mx-auto bg-white/10 backdrop-blur-md text-emerald-300 rounded-full flex items-center justify-center shadow-inner">
              <Sparkles className="w-8 h-8 text-emerald-300" />
            </div>
            
            <p className="text-lg md:text-2xl font-black leading-relaxed md:leading-loose tracking-wide font-sans text-emerald-50 drop-shadow-sm select-none">
              "আমাদের পুঠিয়া শুধু একটি ওয়েবসাইট নয়, এটি পুঠিয়ার মানুষের জন্য একটি ডিজিটাল কমিউনিটি। আপনার সহযোগিতা, মতামত ও অংশগ্রহণই আমাদের এগিয়ে যাওয়ার শক্তি। আসুন, সবাই মিলে একটি স্মার্ট, তথ্যসমৃদ্ধ ও উন্নত পুঠিয়া গড়ে তুলি।" 💚
            </p>
            
            <div className="pt-4 border-t border-white/10 w-48 mx-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
                — আমাদের পুঠিয়া টিম
              </span>
            </div>
          </div>
        </motion.section>

      </div>
      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </motion.div>
  );
};

export default AboutUsPage;

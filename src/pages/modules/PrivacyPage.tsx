import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  Shield, Lock, Eye, Users, CheckCircle2, Heart, 
  Calendar, MapPin, Mail, FileText, Server, TrendingUp, 
  Clock, ArrowLeft, ShieldCheck, Database, Key, HelpCircle, ChevronRight, Settings, Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import BottomNavigation from "../../components/home/BottomNavigation";
import { UnifiedHeroHeader } from "../../components/common/UnifiedDesignSystem";
import SEO from "../../components/SEO";

// Statistics Counter Data for Security
const SECURITY_STATS = [
  { label: "নিরাপদ ডেটা এনক্রিপশন", count: "১০০%", icon: Lock, color: "from-emerald-500 to-green-600" },
  { label: "তৃতীয় পক্ষ শেয়ারিং", count: "০%", icon: ShieldCheck, color: "from-teal-500 to-emerald-600" },
  { label: "সহায়তা ও সিকিউরিটি টিম", count: "২৪/৭", icon: Users, color: "from-green-500 to-emerald-700" },
  { label: "নিরাপত্তা অডিট স্কোর", count: "A+", icon: Server, color: "from-teal-600 to-green-500" },
];

// Timeline Project History (Focused on Safety & Milestones)
const SAFETY_TIMELINE = [
  { 
    year: "২০২৪", 
    title: "গোপনীয়তা নীতিমালা প্রণয়ন", 
    desc: "অ্যাপ চালুর সাথে সাথে ব্যবহারকারীদের তথ্য সুরক্ষায় প্রাথমিক নিয়মাবলী ও ডেটা এনক্রিপশন সিস্টেম যুক্ত করা হয়।", 
    icon: Shield 
  },
  { 
    year: "২০২৫", 
    title: "দ্বিমুখী এনক্রিপশন (SSL)", 
    desc: "সকল পাসওয়ার্ড ও সংবেদনশীল নাগরিক তথ্যের সুরক্ষায় সিকিউর সকেট লেয়ার এবং ফায়ারবেস সিকিউরিটি রুলস আরও কঠোর করা হয়।", 
    icon: Key 
  },
  { 
    year: "২০২৬", 
    title: "স্মার্ট নাগরিক স্বাধিকার ও ট্রাস্ট", 
    desc: "নাগরিকদের যেকোনো সময় ডেটা মুছে ফেলা বা সংশোধন করার পূর্ণ অধিকার প্রদান এবং সম্পূর্ণ বিজ্ঞাপন ও পোস্ট মডারেশন পলিসি চালু।", 
    icon: TrendingUp 
  }
];

// Mission & Vision regarding Trust
const TRUST_MISSION_VISION = [
  {
    title: "আমাদের লক্ষ্য (Mission)",
    desc: "একটি সম্পূর্ণ নির্ভরযোগ্য, সুরক্ষিত এবং জবাবদিহিতামূলক ডিজিটাল প্ল্যাটফর্ম গড়ে তোলা যেখানে পুঠিয়ার প্রতিটি নাগরিক নিজের ব্যক্তিগত গোপনীয়তার কোনো আপস ছাড়াই সকল সরকারি ও বেসরকারি সেবা অনায়াসে গ্রহণ করতে পারেন।",
    icon: TargetIcon,
    bg: "bg-emerald-50 text-emerald-700 border-emerald-100"
  },
  {
    title: "আমাদের ভিশন (Vision)",
    desc: "প্রযুক্তির আধুনিকায়নের সাথে সাথে প্রতিটি ব্যবহারকারীর ডেটা অধিকারকে সর্বোচ্চ সম্মান জানানো। পুঠিয়ার প্রতিটি ডিজিটাল সংযোগ যেন হয় নিরাপদ, বিশ্বাসযোগ্য এবং শতভাগ ক্ষতিকারক সাইবার উপাদান মুক্ত।",
    icon: VisionIcon,
    bg: "bg-teal-50 text-teal-700 border-teal-100"
  }
];

function TargetIcon(props: any) {
  return <TrendingUp className="text-emerald-600" {...props} />;
}

function VisionIcon(props: any) {
  return <Eye className="text-teal-600" {...props} />;
}

export default function PrivacyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <SEO 
        title="গোপনীয়তা নীতি - আমাদের পুঠিয়া"
        description="আমাদের পুঠিয়া প্ল্যাটফর্মের ব্যবহারকারীর তথ্য সুরক্ষা ও গোপনীয়তা নীতি।"
      />

      <Header />

      {/* Full-width Unified Hero Header */}
      <UnifiedHeroHeader
        title="গোপনীয়তা নীতি"
        subtitle="আমাদের পুঠিয়া ব্যবহার করার জন্য আপনাকে ধন্যবাদ। আমরা আপনার ব্যক্তিগত তথ্যের নিরাপত্তা ও গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ।"
        badgeText="নিরাপত্তা ও ডেটা ট্রাস্ট"
        icon={<Shield size={24} />}
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

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-40 space-y-8 flex-grow w-full overflow-hidden relative z-10">
        
        {/* Account Security & Privacy Settings Quick Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">আপনার প্রোফাইল ও পোস্টের প্রাইভেসি পরিবর্তন করতে চান?</h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                আড্ডা পোস্ট Audience, টু-ফ্যাক্টর সিকিউরিটি (2FA), ডিভাইস ম্যানেজমেন্ট ও ব্লক লিস্ট নিয়ন্ত্রণ করুন সিকিউরিটি সেন্টারে।
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/account-security')}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-900 rounded-xl text-xs font-black border-0 cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5 shrink-0 group active:scale-95"
          >
            <span>কন্ট্রোল সেন্টারে যান</span>
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>

        {/* Intro Message Section - 20px Rounded Card with Soft Shadow */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-slate-100 p-6 md:p-8 rounded-[20px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600"></div>
          <p className="text-slate-600 font-medium text-base leading-relaxed pl-2">
            এই গোপনীয়তা নীতিতে বিস্তারিত ব্যাখ্যা করা হয়েছে আমরা কী কী তথ্য সংগ্রহ করি, কীভাবে সেগুলো ব্যবহার করি, আপনার কাছে তথ্যের কী ধরনের নিয়ন্ত্রণ রয়েছে এবং কীভাবে আমরা আপনার তথ্য সম্পূর্ণ সুরক্ষিত রাখি। অনুগ্রহ করে প্ল্যাটফর্মটি ব্যবহারের পূর্বে নীতি মনোযোগ সহকারে পড়ুন।
          </p>
        </motion.section>

        {/* Statistics Counter section */}
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
            <Database size={20} className="text-emerald-600" />
            আমাদের সিকিউরিটি স্ট্যাটিস্টিকস
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SECURITY_STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-white border border-slate-100 rounded-[20px] p-5 text-center shadow-sm hover:shadow-md transition-all group hover:-translate-y-1"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Icon size={20} />
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-emerald-800">{stat.count}</div>
                  <div className="text-[11px] md:text-xs font-extrabold text-slate-450 mt-1">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Mission & Vision Cards Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TRUST_MISSION_VISION.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`border rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all ${item.bg}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800">{item.title}</h3>
                </div>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </section>

        {/* Main Content Sections (1 to 10) */}
        <section className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
            <ShieldCheck size={22} className="text-emerald-600" />
            বিস্তারিত গোপনীয়তা নীতিমালা
          </h2>

          <div className="grid grid-cols-1 gap-6">
            
            {/* 1. আমরা যে তথ্য সংগ্রহ করি */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">১</span>
                আমরা যে তথ্য সংগ্রহ করি
              </h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">
                আমাদের বিভিন্ন নাগরিক সেবা ও ইন্টারঅ্যাকশন সুচারুভাবে পরিচালনার জন্য আমরা নিম্নলিখিত তথ্য সংগ্রহ করতে পারি:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: "নাম", detail: "অ্যাকাউন্ট ভেরিফিকেশন" },
                  { name: "মোবাইল নম্বর", detail: "জরুরি যোগাযোগ ও নিরাপত্তা" },
                  { name: "ইমেইল ঠিকানা", detail: "গুরুত্বপূর্ণ নোটিফিকেশন" },
                  { name: "প্রোফাইল ছবি", detail: "ব্যবহারকারীর আইডেন্টিটি (ঐচ্ছিক)" },
                  { name: "অবস্থান (Location)", detail: "আশেপাশের সেবা প্রদর্শন (ঐচ্ছিক)" },
                  { name: "বিজ্ঞাপন বা পোস্ট সংক্রান্ত তথ্য", detail: "আপনার পোস্টকৃত বিবরণী" },
                  { name: "যোগাযোগের বার্তা", detail: "সরাসরি ইনবক্স ফিডব্যাক" },
                  { name: "ব্যবহার সংক্রান্ত তথ্য (Analytics)", detail: "অ্যাপের কার্যকারিতা পরিমাপ" },
                ].map((info, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-center">
                    <span className="text-sm font-bold text-[#15803d] flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="shrink-0" />
                      {info.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">{info.detail}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 2. তথ্য ব্যবহারের উদ্দেশ্য */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">২</span>
                তথ্য ব্যবহারের উদ্দেশ্য
              </h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed mb-3">
                আপনার সংগৃহীত তথ্য নিম্নোক্ত কল্যাণমুখী ও সেবামূলক কার্যক্রমে ব্যবহৃত হয়ে থাকে:
              </p>
              <ul className="space-y-2 text-slate-600 text-sm font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span><strong>অ্যাকাউন্ট পরিচালনা:</strong> আপনার ব্যক্তিগত প্রোফাইল তৈরি ও আপডেট পরিচালনা করা।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span><strong>নাগরিক সেবা প্রদান:</strong> ই-সেবা আবেদনপত্র ট্র্যাকিং, অনলাইন আবেদন ও ভেরিফিকেশন।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span><strong>বিজ্ঞাপন ও অফার:</strong> ব্যবসার তথ্য, কেনাবেচা বা সম্পত্তি ভাড়ার বিজ্ঞাপন সুরক্ষিতভাবে প্রকাশ।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span><strong>জরুরি নোটিশ পাঠানো:</strong> বন্যা, অতিবৃষ্টি, গুরুত্বপূর্ণ সরকারি ঘোষণা বা স্থানীয় প্রশাসন থেকে প্রেরিত তাৎক্ষণিক সতর্কবার্তা।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span><strong>নিরাপত্তা নিশ্চিতকরণ:</strong> কোনো প্রতারণামূলক কর্মকাণ্ড প্রতিরোধ এবং ব্যবহারকারীর ডেটা অধিকার রক্ষা।</span>
                </li>
              </ul>
            </motion.div>

            {/* 3. Cookies ও প্রযুক্তিগত তথ্য */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">৩</span>
                Cookies ও প্রযুক্তিগত তথ্য
              </h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                ওয়েবসাইটের পারফরম্যান্স ও লোডিং স্পিড উন্নত করতে Cookies এবং অনুরূপ লোকাল স্টোরেজ প্রযুক্তি ব্যবহার করা হতে পারে। এগুলো শুধুমাত্র ব্যবহারকারীর সেশন সচল রাখতে এবং পছন্দসই সেটিংস (যেমন ডার্ক থিম বা ভাষা চয়ন) মনে রাখার জন্য ব্যবহৃত হয়।
              </p>
            </motion.div>

            {/* 4. তথ্যের নিরাপত্তা */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">৪</span>
                 তথ্যের নিরাপত্তা
              </h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                আমরা সর্বোচ্চ গুরুত্ব দিয়ে বিশ্বস্ত ক্লাউড সার্ভার এবং ডাটাবেস নিরাপত্তা রুলস ব্যবহার করি। আপনার পাসওয়ার্ড সম্পূর্ণরূপে হাসড (Hashed) এনক্রিপ্ট অবস্থায় থাকে যা ডেটাবেস এডমিনও দেখতে পারেন না। আপনার তথ্য অননুমোদিত প্রবেশ, অনাকাঙ্ক্ষিত পরিবর্তন বা অপব্যবহার থেকে সম্পূর্ণ সুরক্ষিত রাখতে আমরা প্রতিনিয়ত আমাদের সিস্টেম মনিটর করি।
              </p>
            </motion.div>

            {/* 5. তথ্য শেয়ারিং */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">৫</span>
                তথ্য শেয়ারিং (Third-Party Sharing)
              </h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                <strong>আমরা আপনার কোনো ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি, লিজ বা বাণিজ্যিক উদ্দেশ্যে কখনো প্রদান করব না।</strong> তবে জাতীয় নিরাপত্তা, আইনগত জটিলতা এড়াতে বা সরকারি আদালতের নির্দেশ ও স্থানীয় প্রশাসনের আইনসম্মত অনুরোধ সাপেক্ষে প্রয়োজনীয় তথ্য আইন প্রয়োগকারী সংস্থার সাথে শেয়ার করা হতে পারে।
              </p>
            </motion.div>

            {/* 6. ব্যবহারকারীর দায়িত্ব */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">৬</span>
                ব্যবহারকারীর দায়িত্ব
              </h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed mb-3">
                একটি সুস্থ ও নিরাপদ সামাজিক পরিবেশ বজায় রাখতে প্রত্যেক ব্যবহারকারীকে অবশ্যই নিম্নলিখিত দায়িত্ব পালন করতে হবে:
              </p>
              <div className="space-y-2.5">
                {[
                  "নিবন্ধন বা ফরম পূরণের সময় সর্বদা সঠিক ও সত্য তথ্য প্রদান করুন।",
                  "কোনো অবস্থাতেই কোনো বিভ্রান্তিকর, কুরুচিপূর্ণ বা বেআইনি তথ্য প্রচার করা যাবে না।",
                  "অন্য কোনো ব্যবহারকারীর ব্যক্তিগত মোবাইল নম্বর বা বিবরণী তার অনুমতি ছাড়া প্রকাশ করা আইনত দণ্ডনীয় অপরাধ।"
                ].map((duty, index) => (
                  <div key={index} className="flex items-center gap-3 bg-red-50/50 border border-red-100/50 p-3 rounded-xl">
                    <span className="text-red-500 font-extrabold text-xs shrink-0 bg-white shadow-sm w-5 h-5 rounded-full flex items-center justify-center">{index + 1}</span>
                    <span className="text-xs font-bold text-slate-700">{duty}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 7. তৃতীয় পক্ষের লিংক */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">৭</span>
                তৃতীয় পক্ষের লিংক
              </h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                এই প্ল্যাটফর্মে বিভিন্ন সরকারি সেবার পোর্টাল বা বিশ্বস্ত বাহ্যিক ওয়েবসাইটের লিংক (যেমন: বাংলাদেশ জাতীয় তথ্য বাতায়ন) থাকতে পারে। ওই সকল বাহ্যিক ওয়েবসাইটের নিজস্ব গোপনীয়তা নীতি এবং ডেটা সংগ্রহের জন্য &quot;আমাদের পুঠিয়া&quot; কর্তৃপক্ষ কোনোভাবেই দায়ী থাকবে না। ব্যবহার করার পূর্বে তাদের নীতিমালা দেখে নেওয়ার পরামর্শ দেওয়া হচ্ছে।
              </p>
            </motion.div>

            {/* 8. শিশুদের গোপনীয়তা */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">৮</span>
                শিশুদের গোপনীয়তা (Children&apos;s Privacy)
              </h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                আমরা ১৩ বছরের কম বয়সী শিশুদের কাছ থেকে ইচ্ছাকৃতভাবে কোনো ব্যক্তিগত তথ্য সংগ্রহ বা সংরক্ষণ করি না। ভুলবশত কোনো শিশুর ব্যক্তিগত তথ্য আমাদের সার্ভারে সংরক্ষিত হয়েছে বলে মনে হলে, অনতিবিলম্বে আমাদের সাথে যোগাযোগ করুন; আমরা তৎক্ষণাৎ ডেটা মুছে ফেলার ব্যবস্থা গ্রহণ করব।
              </p>
            </motion.div>

            {/* 9. নীতিমালার পরিবর্তন */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">৯</span>
                নীতিমালার পরিবর্তন
              </h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                প্রযুক্তির পরিবর্তনের সাথে সাথে যেকোনো সময় এই গোপনীয়তা নীতি সংশোধন, পরিবর্ধন বা সম্পূর্ণ হালনাগাদ করার অধিকার আমাদের রয়েছে। নীতিমালায় বড় ধরনের কোনো পরিবর্তন এলে আমরা তা বিজ্ঞপ্তি প্রকাশ বা পুশ নোটিফিকেশনের মাধ্যমে ব্যবহারকারীদের তাৎক্ষণিকভাবে অবহিত করব।
              </p>
            </motion.div>

            {/* 10. যোগাযোগ */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full flex items-center justify-center text-emerald-600">
                <Mail size={24} className="translate-x-3 -translate-y-3" />
              </div>
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">১০</span>
                যোগাযোগ ও সহায়তা
              </h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">
                গোপনীয়তা নীতি বা ডেটা নিরাপত্তা সম্পর্কে কোনো প্রশ্ন, কোনো প্রকার অভিযোগ অথবা ডেটা সংশোধনের আবেদন থাকলে সরাসরি আমাদের টিম বা অফিসিয়াল ঠিকানায় নির্দ্বিধায় লিখুন:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-700">ইমেইল ঠিকানা</h4>
                    <a href="mailto:info@Ourputhia.com" className="text-sm font-bold text-emerald-700 hover:underline">info@Ourputhia.com</a>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-700">অফিসিয়াল কার্যালয়</h4>
                    <p className="text-sm font-bold text-slate-650">পুঠিয়া, রাজশাহী, বাংলাদেশ</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Safety Timeline Section */}
        <section className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
            <Clock size={22} className="text-emerald-600" />
            সিকিউরিটি ও ট্রাস্ট জার্নি (Timeline)
          </h2>
          
          <div className="relative border-l border-emerald-200 ml-4 md:ml-6 pl-6 space-y-8">
            {SAFETY_TIMELINE.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative"
                >
                  {/* Timeline bullet icon */}
                  <span className="absolute -left-[37px] top-0.5 bg-emerald-100 border border-emerald-600 rounded-full w-8 h-8 flex items-center justify-center text-emerald-700 shadow-sm">
                    <Icon size={14} />
                  </span>

                  <div className="bg-white border border-slate-100 rounded-[20px] p-5 shadow-sm hover:shadow-md transition-shadow">
                    <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-100 mb-2">
                      {step.year}
                    </span>
                    <h3 className="text-base font-black text-slate-800">{step.title}</h3>
                    <p className="text-slate-600 text-sm mt-1.5 font-medium leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
}

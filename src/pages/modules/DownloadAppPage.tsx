import React, { useEffect } from "react";
import { motion } from "motion/react";
import { 
  Smartphone, Download, Shield, Zap, Search, 
  Heart, Bell, Languages, ArrowLeft, Clock,
  CheckCircle2, AlertTriangle, Layers, Info, MapPin, Mail, Landmark, Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import BottomNavigation from "../../components/home/BottomNavigation";
import { UnifiedHeroHeader } from "../../components/common/UnifiedDesignSystem";
import SEO from "../../components/SEO";

// Statistics Counter Data
const APP_STATS = [
  { label: "ব্যবহারকারী ইন্টারফেস", count: "বাংলা", icon: Languages, color: "from-emerald-500 to-green-600" },
  { label: "নিরাপত্তা", count: "১০০%", icon: Shield, color: "from-teal-500 to-emerald-600" },
  { label: "গতি", count: "দ্রুত", icon: Zap, color: "from-green-500 to-emerald-700" },
  { label: "আপডেট", count: "নিয়মিত", icon: Bell, color: "from-teal-600 to-green-500" },
];

// Project History
const APP_TIMELINE = [
  { year: "২০২৪", title: "প্ল্যাটফর্মের যাত্রা শুরু", desc: "আমাদের পুঠিয়া ডিজিটাল প্ল্যাটফর্মের ওয়েব সংস্করণ চালু ও অ্যাপের পরিকল্পনা গ্রহণ।", icon: Smartphone },
  { year: "২০২৫", title: "অ্যাপের প্রোটোটাইপ", desc: "মোবাইল-বান্ধব ডিজাইনের প্রোটোটাইপ তৈরি ও ব্যবহারকারী অভিজ্ঞতার উন্নতি।", icon: Zap },
  { year: "২০২৬", title: "অ্যাপ রিলিজ", desc: "সকল নাগরিকের জন্য স্মার্ট 'আমাদের পুঠিয়া' অ্যাপ রিলিজের প্রস্তুতি গ্রহণ।", icon: Download }
];

// Mission & Vision regarding Trust
const MISSION_VISION = [
  {
    title: "আমাদের লক্ষ্য (Mission)",
    desc: "পুঠিয়ার প্রতিটি নাগরিকের হাতে তথ্যের শক্তি পৌঁছে দেওয়া এবং সরকারি-বেসরকারি সকল সেবা ডিজিটাল প্ল্যাটফর্মের মাধ্যমে সহজলভ্য করা।",
    icon: CheckCircle2,
    bg: "bg-emerald-50 text-emerald-700 border-emerald-100"
  },
  {
    title: "আমাদের ভিশন (Vision)",
    desc: "পুঠিয়াকে একটি পরিপূর্ণ স্মার্ট উপজেলা হিসেবে রূপান্তর করতে প্রযুক্তির মাধ্যমে প্রতিটি ঘরে সেবা পৌঁছে দেওয়া।",
    icon: Smartphone,
    bg: "bg-teal-50 text-teal-700 border-teal-100"
  }
];

export default function DownloadAppPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <SEO 
        title="আমাদের পুঠিয়া অ্যাপ ডাউনলোড - Download App"
        description="আমাদের পুঠিয়া মোবাইল অ্যাপ ডাউনলোড ও ইনস্টলেশন নির্দেশিকা।"
      />

      <Header />

      {/* Full-width Unified Hero Header */}
      <UnifiedHeroHeader
        title="আমাদের পুঠিয়া অ্যাপ"
        subtitle='"আমাদের পুঠিয়া" মোবাইল অ্যাপ আপনাকে পুঠিয়া উপজেলার তথ্য, সেবা ও গুরুত্বপূর্ণ আপডেট আরও দ্রুত ও সহজে ব্যবহারের সুযোগ দেয়।'
        badgeText="স্মার্ট মোবাইল অ্যাপ্লিকেশন"
        icon={<Smartphone size={24} />}
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

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-40 space-y-12 flex-grow relative z-10">
        
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-slate-100 p-6 md:p-8 rounded-[20px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600"></div>
          <p className="text-slate-600 font-medium text-base leading-relaxed pl-2">
            যেকোনো সময়, যেকোনো স্থান থেকে আপনার প্রয়োজনীয় তথ্য হাতের মুঠোয় রাখুন। "আমাদের পুঠিয়া" অ্যাপটির মাধ্যমে আপনি পাচ্ছেন উপজেলা সম্পর্কিত সকল তথ্য ও জরুরি সেবা।
          </p>
        </motion.section>

        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
            <CheckCircle2 size={20} className="text-emerald-600" />
            অ্যাপের সক্ষমতা
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {APP_STATS.map((stat, i) => {
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

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MISSION_VISION.map((item, idx) => {
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

        <section className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
            <Layers size={22} className="text-emerald-600" />
            অ্যাপে যা যা পাবেন
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "সর্বশেষ খবর ও ঘোষণা", "উপজেলা সম্পর্কিত তথ্য", "জরুরি সেবা ও গুরুত্বপূর্ণ নম্বর", "হাসপাতাল, ডাক্তার ও স্বাস্থ্যসেবা",
              "শিক্ষা প্রতিষ্ঠান ও শিক্ষা তথ্য", "হোটেল, রেস্টুরেন্ট ও দর্শনীয় স্থান", "কেনা-বেচা ও স্থানীয় বাজার", "বাড়ি ও দোকান ভাড়া",
              "ব্যবসা ডিরেক্টরি", "ছবি ও ভিডিও গ্যালারি", "স্থানীয় ইভেন্ট ও অনুষ্ঠান", "গুরুত্বপূর্ণ নোটিফিকেশন"
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
                className="bg-white border border-slate-100 rounded-[20px] p-4 flex items-center gap-3 shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-sm font-bold text-slate-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-emerald-900 rounded-[30px] p-8 text-white text-center shadow-lg">
          <h3 className="text-2xl font-black mb-4">ডাউনলোড</h3>
          <p className="text-emerald-100 font-medium mb-8 max-w-lg mx-auto">
            "স্মার্ট পুঠিয়া, আপনার হাতের মুঠোয়। আজই 'আমাদের পুঠিয়া' অ্যাপ ব্যবহার করুন এবং উপজেলার সকল তথ্য ও সেবা সহজে উপভোগ করুন।"
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <div className="px-6 py-3 bg-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2 opacity-75 cursor-not-allowed">
              <Download size={18} /> Android অ্যাপ – শীঘ্রই আসছে
            </div>
            <div className="px-6 py-3 bg-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2 opacity-75 cursor-not-allowed">
              <Download size={18} /> iOS অ্যাপ – শীঘ্রই আসছে
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
            <Clock size={22} className="text-emerald-600" />
            প্রকল্পের যাত্রা (Timeline)
          </h2>
          
          <div className="relative border-l border-emerald-200 ml-4 md:ml-6 pl-6 space-y-8">
            {APP_TIMELINE.map((step, idx) => {
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

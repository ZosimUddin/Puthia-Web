import React, { useEffect } from "react";
import { motion } from "motion/react";
import { 
  FileText, Shield, ArrowLeft, Clock, CheckCircle2, 
  Database, Eye, Users, Layers, Info, Mail, MapPin, 
  AlertTriangle, Image as ImageIcon, Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import BottomNavigation from "../../components/home/BottomNavigation";
import { UnifiedHeroHeader } from "../../components/common/UnifiedDesignSystem";
import SEO from "../../components/SEO";

// Statistics Counter Data
const POLICY_STATS = [
  { label: "তথ্য নির্ভরযোগ্যতা", count: "৯৯%", icon: Shield, color: "from-emerald-500 to-green-600" },
  { label: "কনটেন্ট মনিটরিং", count: "২৪/৭", icon: Eye, color: "from-teal-500 to-emerald-600" },
  { label: "ব্যবহারকারীর অংশগ্রহণ", count: "উন্মুক্ত", icon: Users, color: "from-green-500 to-emerald-700" },
  { label: "সঠিকতা অডিট", count: "দৈনিক", icon: Database, color: "from-teal-600 to-green-500" },
];

// Project History
const POLICY_TIMELINE = [
  { year: "২০২৪", title: "প্ল্যাটফর্মের যাত্রা শুরু", desc: "তথ্যের সঠিকতা নিশ্চিত করতে প্রাথমিক কনটেন্ট মডারেশন নীতিমালা চালু করা হয়।", icon: FileText },
  { year: "২০২৫", title: "কনটেন্ট অটোমেশন", desc: "ছবি ও ভিডিওর নিরাপত্তা নিশ্চিত করতে উন্নত এআই-বেসড কনটেন্ট যাচাই পদ্ধতি যুক্ত করা হয়।", icon: Layers },
  { year: "২০২৬", title: "স্মার্ট নীতিমালা হালনাগাদ", desc: "নাগরিক তথ্যের স্বচ্ছতা ও কপিরাইট সুরক্ষায় আধুনিক স্মার্ট ডেটা নীতিমালা প্রণয়ন।", icon: Shield },
];

// Mission & Vision regarding Trust
const MISSION_VISION = [
  {
    title: "আমাদের লক্ষ্য (Mission)",
    desc: "একটি সম্পূর্ণ নির্ভরযোগ্য, সুরক্ষিত এবং জবাবদিহিতামূলক ডিজিটাল প্ল্যাটফর্ম গড়ে তোলা যেখানে পুঠিয়ার প্রতিটি নাগরিক তথ্যের সঠিকতা ও গোপনীয়তা নিয়ে নিশ্চিন্ত থাকতে পারেন।",
    icon: CheckCircle2,
    bg: "bg-emerald-50 text-emerald-700 border-emerald-100"
  },
  {
    title: "আমাদের ভিশন (Vision)",
    desc: "প্রযুক্তির আধুনিকায়নের সাথে সাথে প্রতিটি তথ্যের নির্ভরযোগ্যতাকে সর্বোচ্চ সম্মান জানানো। পুঠিয়ার প্রতিটি ডিজিটাল কনটেন্ট যেন হয় বস্তুনিষ্ঠ, বিশ্বাসযোগ্য এবং শতভাগ ক্ষতিকারক উপাদান মুক্ত।",
    icon: Eye,
    bg: "bg-teal-50 text-teal-700 border-teal-100"
  }
];

export default function ContentPolicyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <SEO 
        title="কন্টেন্ট নীতিমালা - Data & Content Policy - আমাদের পুঠিয়া"
        description="আমাদের পুঠিয়া প্ল্যাটফর্মের ডাটা ও কনটেন্ট নীতি এবং ব্যবহারের শর্তাবলী।"
      />

      <Header />

      {/* Full-width Unified Hero Header */}
      <UnifiedHeroHeader
        title="Data & Content Policy"
        subtitle='"আমাদের পুঠিয়া" প্ল্যাটফর্মে প্রকাশিত তথ্য, ছবি, ভিডিও ও অন্যান্য কন্টেন্টের সঠিকতা, মান এবং নিরাপত্তা নিশ্চিত করতে এই নীতিমালা প্রণয়ন করা হয়েছে।'
        badgeText="কন্টেন্ট নীতিমালা ও গাইডলাইন"
        icon={<FileText size={24} />}
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
            আমাদের এই প্ল্যাটফর্মে প্রকাশিত তথ্যের নির্ভরযোগ্যতা ও মান বজায় রাখা আমাদের অঙ্গীকার। সকল ব্যবহারকারীকে প্ল্যাটফর্ম ব্যবহারের পূর্বে এই নীতিমালা মনোযোগ সহকারে পড়ার পরামর্শ দেওয়া হলো।
          </p>
        </motion.section>

        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
            <Layers size={20} className="text-emerald-600" />
            নীতিমালার মানদণ্ড
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {POLICY_STATS.map((stat, i) => {
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
            <FileText size={22} className="text-emerald-600" />
            বিস্তারিত নীতিমালা
          </h2>

          <div className="grid grid-cols-1 gap-6">
            
            {[
              { title: "১. নীতিমালার উদ্দেশ্য", desc: "নির্ভরযোগ্য তথ্য প্রকাশ, বিভ্রান্তি প্রতিরোধ, মেধাস্বত্বের সম্মান রক্ষা এবং একটি মানসম্মত ডিজিটাল প্ল্যাটফর্ম নিশ্চিত করা।" },
              { title: "২. তথ্যের উৎস", desc: "সরকারি সংস্থা, শিক্ষা প্রতিষ্ঠান, স্বাস্থ্যসেবা কেন্দ্র, স্থানীয় ব্যবসা এবং ব্যবহারকারীর প্রদত্ত নির্ভরযোগ্য উৎস থেকে তথ্য সংগৃহীত হয়।" },
              { title: "৩. তথ্যের সঠিকতা", desc: "সর্বোচ্চ নির্ভুল তথ্যের চেষ্টা করা হয়, তবে সব তথ্য শতভাগ নির্ভুল না-ও হতে পারে। ভুল চোখে পড়লে আমাদের অবহিত করুন।" },
              { title: "৪. ব্যবহারকারীর কনটেন্ট", desc: "ব্যবহারকারীর পোস্ট করা কনটেন্টের দায়িত্ব তাদের নিজস্ব। তথ্য সত্য ও আইনসম্মত হতে হবে।" },
              { title: "৫. নিষিদ্ধ কনটেন্ট", desc: "মিথ্যা তথ্য, ঘৃণা বা সহিংস বক্তব্য, অশ্লীল কনটেন্ট, কপিরাইট লঙ্ঘন বা প্রতারণামূলক বিজ্ঞাপন নিষিদ্ধ।" },
              { title: "৬. ছবি ও ভিডিও", desc: "নিজস্ব বা অনুমোদিত ছবি/ভিডিও আপলোড করুন। ব্যক্তিগত গোপনীয়তা বা সম্পাদনা বিভ্রান্তি এড়িয়ে চলুন।" },
              { title: "৭. কপিরাইট", desc: "অন্যের মেধাস্বত্ব ও কপিরাইটকে সম্মান করুন। অনুমতি ছাড়া তথ্য বা উপাদান কপি বা পুনঃপ্রকাশ নিষিদ্ধ।" },
              { title: "৮. তথ্য সংশোধন ও অপসারণ", desc: "কর্তৃপক্ষ যেকোনো সময় ভুল তথ্য সংশোধন, কনটেন্ট সম্পাদনা বা নীতিমালা লঙ্ঘনকারী উপাদান অপসারণের অধিকার রাখে।" },
              { title: "৯. রিপোর্ট করার সুযোগ", desc: "কোনো তথ্য ভুল, বিভ্রান্তিকর বা নীতিমালা ভঙ্গকারী হলে রিপোর্ট অপশনের মাধ্যমে আমাদের জানান।" },
              { title: "১০. নীতিমালার পরিবর্তন", desc: "প্রয়োজনে যেকোনো সময় এই নীতিমালা হালনাগাদ করা হতে পারে। নতুন সংস্করণ প্রকাশের পর থেকে কার্যকর।" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all"
              >
                <h3 className="text-base font-black text-slate-800 mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</span>
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed pl-10">
                  {item.desc}
                </p>
              </motion.div>
            ))}

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
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">১১</span>
                যোগাযোগ ও সহায়তা
              </h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">
                এই নীতিমালা সম্পর্কে কোনো প্রশ্ন, অভিযোগ বা মতামত থাকলে সরাসরি আমাদের সাথে যোগাযোগ করুন:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-700">ইমেইল ঠিকানা</h4>
                    <a href="mailto:info@puthia.gov.bd" className="text-sm font-bold text-emerald-700 hover:underline">info@puthia.gov.bd</a>
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

        <section className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
            <Clock size={22} className="text-emerald-600" />
            প্রকল্পের যাত্রা (Timeline)
          </h2>
          
          <div className="relative border-l border-emerald-200 ml-4 md:ml-6 pl-6 space-y-8">
            {POLICY_TIMELINE.map((step, idx) => {
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

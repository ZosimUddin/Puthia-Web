import React, { useEffect } from "react";
import { motion } from "motion/react";
import { 
  FileText, Shield, ArrowLeft, Clock, CheckCircle2, 
  AlertTriangle, CreditCard, User, Copyright, RefreshCw, 
  Phone, MapPin, Mail, Landmark, Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import BottomNavigation from "../../components/home/BottomNavigation";
import { UnifiedHeroHeader } from "../../components/common/UnifiedDesignSystem";
import SEO from "../../components/SEO";

// Statistics Counter Data
const TERMS_STATS = [
  { label: "নিয়মাবলী কার্যকর", count: "২০২৬", icon: Clock, color: "from-emerald-500 to-green-600" },
  { label: "স্বচ্ছতা", count: "১০০%", icon: Shield, color: "from-teal-500 to-emerald-600" },
  { label: "দায়বদ্ধতা", count: "স্বচ্ছ", icon: CheckCircle2, color: "from-green-500 to-emerald-700" },
  { label: "আইনগত মান", count: "A+", icon: Landmark, color: "from-teal-600 to-green-500" },
];

// Project History
const TERMS_TIMELINE = [
  { year: "২০২৪", title: "প্ল্যাটফর্মের যাত্রা শুরু", desc: "আমাদের পুঠিয়া ডিজিটাল প্ল্যাটফর্মের আনুষ্ঠানিক কার্যক্রম ও প্রাথমিক শর্তাবলী চালু করা হয়।", icon: FileText },
  { year: "২০২৫", title: "সেবা ও নিরাপত্তা বিস্তার", desc: "নাগরিক সেবা ও কেনাবেচার নীতিমালা আরও সুনির্দিষ্ট এবং ডিজিটাল লেনদেনের নিরাপত্তা কঠোর করা হয়।", icon: Shield },
  { year: "২০২৬", title: "স্মার্ট নীতিমালা হালনাগাদ", desc: "ব্যবহারকারী ও প্ল্যাটফর্মের অধিকার সুরক্ষায় নতুন স্মার্ট ডিজিটাল শর্তাবলী ও কমপ্লায়েন্স নীতি সংযোজন।", icon: RefreshCw }
];

// Mission & Vision regarding Trust
const MISSION_VISION = [
  {
    title: "আমাদের লক্ষ্য (Mission)",
    desc: "একটি সম্পূর্ণ নির্ভরযোগ্য, সুরক্ষিত এবং জবাবদিহিতামূলক ডিজিটাল প্ল্যাটফর্ম গড়ে তোলা যেখানে পুঠিয়ার প্রতিটি নাগরিক নিজের ব্যক্তিগত গোপনীয়তার কোনো আপস ছাড়াই সকল সরকারি ও বেসরকারি সেবা অনায়াসে গ্রহণ করতে পারেন।",
    icon: CheckCircle2,
    bg: "bg-emerald-50 text-emerald-700 border-emerald-100"
  },
  {
    title: "আমাদের ভিশন (Vision)",
    desc: "প্রযুক্তির আধুনিকায়নের সাথে সাথে প্রতিটি ব্যবহারকারীর ডেটা অধিকারকে সর্বোচ্চ সম্মান জানানো। পুঠিয়ার প্রতিটি ডিজিটাল সংযোগ যেন হয় নিরাপদ, বিশ্বাসযোগ্য এবং শতভাগ ক্ষতিকারক সাইবার উপাদান মুক্ত।",
    icon: Shield,
    bg: "bg-teal-50 text-teal-700 border-teal-100"
  }
];

export default function TermsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <SEO 
        title="শর্তাবলী ও নিয়মাবলী - আমাদের পুঠিয়া"
        description="আমাদের পুঠিয়া প্ল্যাটফর্মের ব্যবহারবিধি, শর্তাবলী ও আইনগত মানদণ্ড।"
      />

      <Header />

      {/* Full-width Unified Hero Header */}
      <UnifiedHeroHeader
        title="ব্যবহারের শর্তাবলী"
        subtitle='"আমাদের পুঠিয়া" ডিজিটাল প্ল্যাটফর্মে আপনাকে স্বাগতম। এই প্ল্যাটফর্ম ব্যবহারের মাধ্যমে আপনি আমাদের শর্তাবলী মেনে নিতে সম্মত হচ্ছেন।'
        badgeText="শর্তাবলী ও নীতিমালা"
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
            এই ওয়েবসাইট ব্যবহার করলে ধরে নেওয়া হবে যে আপনি এই শর্তাবলী ও গোপনীয়তা নীতি পড়েছেন, বুঝেছেন এবং মেনে নিয়েছেন। অনুগ্রহ করে প্ল্যাটফর্মটি ব্যবহারের পূর্বে নীতি মনোযোগ সহকারে পড়ুন।
          </p>
        </motion.section>

        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
            <CheckCircle2 size={20} className="text-emerald-600" />
            প্ল্যাটফর্মের মানদণ্ড
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TERMS_STATS.map((stat, i) => {
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
            বিস্তারিত শর্তাবলী (Terms)
          </h2>

          <div className="grid grid-cols-1 gap-6">
            
            {[
              { title: "১. শর্তাবলী গ্রহণ", desc: "এই ওয়েবসাইট ব্যবহার করলে ধরে নেওয়া হবে যে আপনি এই শর্তাবলী ও গোপনীয়তা নীতি পড়েছেন, বুঝেছেন এবং মেনে নিয়েছেন।" },
              { title: "২. ব্যবহারকারীর দায়িত্ব", desc: "সঠিক ও সত্য তথ্য প্রদান করুন। ভুয়া, বিভ্রান্তিকর, অবৈধ তথ্য বা অন্যের পরিচয় ব্যবহার নিষিদ্ধ। আইন ও নৈতিকতা মেনে চলুন।" },
              { title: "৩. পোস্ট ও কনটেন্ট", desc: "পোস্টের সম্পূর্ণ দায়ভার ব্যবহারকারীর। মিথ্যা, কপিরাইট লঙ্ঘনকারী, অশ্লীল বা ঘৃণা ছড়ানো কনটেন্ট নিষিদ্ধ এবং পূর্ব নোটিশ ছাড়াই অপসারণ করা হতে পারে।" },
              { title: "৪. কেনাবেচা ও সেবা", desc: "প্ল্যাটফর্ম কর্তৃপক্ষ ক্রেতা-বিক্রেতা বা মালিক-ভাড়াটিয়ার লেনদেনের দায়ভার নেয় না। আর্থিক লেনদেন বা প্রতারণার জন্য আমরা দায়ী নই।" },
              { title: "৫. অ্যাকাউন্ট নিরাপত্তা", desc: "অ্যাকাউন্টের পাসওয়ার্ড গোপন রাখা ব্যবহারকারীর দায়িত্ব। সন্দেহজনক কার্যকলাপে অ্যাকাউন্ট স্থগিত করা হতে পারে।" },
              { title: "৬. মেধাস্বত্ব", desc: "ডিজাইন, লোগো, টেক্সট এবং অন্যান্য উপাদান আমাদের মেধাস্বত্ব। অনুমতি ছাড়া পুনঃপ্রকাশ বা কপি করা নিষিদ্ধ।" },
              { title: "৭. সেবা পরিবর্তন", desc: "আমরা যেকোনো সময় নতুন ফিচার যোগ বা সেবা বন্ধ করার অধিকার সংরক্ষণ করি।" },
              { title: "৮. দায়বদ্ধতার সীমা", desc: "তথ্যাদি সঠিক রাখার সর্বোচ্চ চেষ্টা সত্ত্বেও, ভুল বা প্রযুক্তিগত সমস্যার কারণে ক্ষতির দায় আমাদের নয়।" },
              { title: "৯. আইন প্রয়োগ", desc: "বাংলাদেশের প্রচলিত আইন অনুযায়ী এই শর্তাবলী পরিচালিত হবে।" },
              { title: "১০. শর্তাবলীর পরিবর্তন", desc: "পরিবর্তিত শর্তাবলী ওয়েবসাইটে প্রকাশের পর থেকেই কার্যকর হবে।" },
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
                শর্তাবলী সম্পর্কে কোনো প্রশ্ন, অভিযোগ বা মতামত থাকলে সরাসরি আমাদের সাথে যোগাযোগ করুন:
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
            {TERMS_TIMELINE.map((step, idx) => {
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

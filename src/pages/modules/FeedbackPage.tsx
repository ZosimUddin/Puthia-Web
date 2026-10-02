import React, { useEffect } from "react";
import { motion } from "motion/react";
import { 
  AlertTriangle, Lightbulb, Edit3, Bug, ArrowLeft, 
  Send, FileText, CheckCircle2, Phone, Mail, 
  HelpCircle, ChevronRight, Upload, Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import BottomNavigation from "../../components/home/BottomNavigation";
import { UnifiedHeroHeader } from "../../components/common/UnifiedDesignSystem";
import SEO from "../../components/SEO";

// Quick Action Cards
const ACTIONS = [
  { title: "অভিযোগ করুন", icon: AlertTriangle, color: "text-red-600 bg-red-50 border-red-100", label: "🚨" },
  { title: "পরামর্শ দিন", icon: Lightbulb, color: "text-amber-600 bg-amber-50 border-amber-100", label: "💡" },
  { title: "তথ্য সংশোধন", icon: Edit3, color: "text-blue-600 bg-blue-50 border-blue-100", label: "✏️" },
  { title: "বাগ রিপোর্ট", icon: Bug, color: "text-purple-600 bg-purple-50 border-purple-100", label: "🐞" },
];

// Process Steps
const PROCESS_STEPS = [
  { title: "জমা দিন", desc: "অভিযোগ বা পরামর্শ জমা দিন।" },
  { title: "পর্যালোচনা", desc: "আমরা বিষয়টি গ্রহণ করে পর্যালোচনা করব।" },
  { title: "যোগাযোগ", desc: "প্রয়োজনে আপনার সাথে যোগাযোগ করা হবে।" },
  { title: "যাচাই ও সমাধান", desc: "যাচাই শেষে প্রয়োজনীয় ব্যবস্থা নেওয়া হবে।" },
  { title: "ফলাফল", desc: "সম্ভব হলে আপনাকে ফলাফল জানানো হবে।" },
];

// FAQ Data
const FAQS = [
  { q: "অভিযোগ জমা দেওয়ার পর কতক্ষণ অপেক্ষা করতে হবে?", a: "সাধারণত ১-৩ কার্যদিবসের মধ্যে আমরা প্রাথমিক পর্যালোচনা শেষ করি।" },
  { q: "আমি কি বেনামে অভিযোগ করতে পারি?", a: "হ্যাঁ, তবে সঠিক সমাধানের জন্য আমরা নাম ও যোগাযোগের তথ্য প্রদানের পরামর্শ দিই।" },
  { q: "তথ্য সংশোধনের জন্য কি কোনো প্রমাণ লাগবে?", a: "সংশ্লিষ্ট পেজের লিংক বা সঠিক তথ্যের সোর্স দিলে আমাদের যাচাই করতে সুবিধা হয়।" },
  { q: "প্রযুক্তিগত সমস্যা হলে স্ক্রিনশট কোথায় দেব?", a: "আমাদের ফর্মে ফাইল অ্যাটাচমেন্ট অপশন ব্যবহার করে স্ক্রিনশট পাঠাতে পারেন।" },
];

export default function FeedbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <SEO 
        title="অভিযোগ ও পরামর্শ - আমাদের পুঠিয়া"
        description="আমাদের পুঠিয়া প্ল্যাটফর্মের মানোন্নয়নে আপনার অভিযোগ, মতামত ও পরামর্শ জমা দিন।"
      />

      <Header />

      {/* Full-width Unified Hero Header */}
      <UnifiedHeroHeader
        title="অভিযোগ ও পরামর্শ"
        subtitle='"আমাদের পুঠিয়া" প্ল্যাটফর্মকে আরও উন্নত করতে আপনার অভিযোগ, মতামত ও পরামর্শ জানান। আমরা দ্রুত পর্যালোচনা করব।'
        badgeText="নাগরিক অভিযোগ ও মতামত"
        icon={<AlertTriangle size={24} />}
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

      <main className="max-w-5xl mx-auto px-4 pt-6 pb-40 space-y-16 flex-grow relative z-10">
        
        {/* Quick Action Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ACTIONS.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`border rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group ${action.color}`}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{action.label}</div>
              <h4 className="text-sm font-black">{action.title}</h4>
            </motion.div>
          ))}
        </section>

        {/* Categories Grid */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800 mb-2">কী ধরনের অভিযোগ বা পরামর্শ পাঠাতে পারবেন?</h2>
            <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { t: "🛠️ প্রযুক্তিগত সমস্যা", d: "ওয়েবসাইট বা অ্যাপের টেকনিক্যাল ত্রুটি" },
              { t: "📰 তথ্যগত ত্রুটি", d: "ভুল বা অসম্পূর্ণ তথ্য সংশোধন" },
              { t: "🏢 প্রতিষ্ঠান সংশোধন", d: "সেবা বা প্রতিষ্ঠানের তথ্য আপডেট" },
              { t: "📢 কন্টেন্ট রিপোর্ট", d: "আপত্তিকর বা বিভ্রান্তিকর তথ্য" },
              { t: "🛒 বিজ্ঞাপন অভিযোগ", d: "কেনা-বেচা বা ভাড়ার বিজ্ঞাপন" },
              { t: "💡 নতুন ফিচার", d: "প্ল্যাটফর্মের উন্নতির নতুন আইডিয়া" },
              { t: "🌟 সাধারণ মতামত", d: "আপনার অভিজ্ঞতা আমাদের জানান" }
            ].map((cat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:bg-emerald-50 transition-colors"
              >
                <h4 className="font-black text-slate-800 text-sm mb-1">{cat.t}</h4>
                <p className="text-xs text-slate-500 font-bold">{cat.d}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Feedback Form */}
        <section className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <h3 className="text-2xl font-black text-slate-800 mb-8 relative z-10 flex items-center gap-3">
             অভিযোগ/পরামর্শ ফর্ম
          </h3>
          <form className="space-y-5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 ml-1">👤 পূর্ণ নাম</label>
                <input type="text" placeholder="নাম লিখুন" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 ml-1">📧 ইমেইল ঠিকানা</label>
                <input type="email" placeholder="example@mail.com" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 ml-1">📱 মোবাইল নম্বর (ঐচ্ছিক)</label>
                <input type="text" placeholder="০১৭xxxxxxxx" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 ml-1">📂 বিভাগ নির্বাচন</label>
                <select className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white font-bold text-slate-700">
                  <option>নির্বাচন করুন</option>
                  <option>অভিযোগ</option>
                  <option>পরামর্শ</option>
                  <option>তথ্য সংশোধন</option>
                  <option>প্রযুক্তিগত সমস্যা</option>
                  <option>অন্যান্য</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 ml-1">📝 বিষয়</label>
              <input type="text" placeholder="আপনার বার্তার শিরোনাম" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 ml-1">📄 বিস্তারিত বিবরণ</label>
              <textarea placeholder="আপনার কথা বিস্তারিতভাবে লিখুন..." rows={6} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 ml-1">📍 সংশ্লিষ্ট পেজ বা লিংক (ঐচ্ছিক)</label>
              <input type="text" placeholder="লিংক যুক্ত করুন" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
              <button type="button" className="w-full md:w-auto flex items-center justify-center gap-2 text-sm font-black text-slate-600 bg-slate-100 px-6 py-4 rounded-2xl hover:bg-slate-200 transition-colors">
                <Upload size={20} /> 📎 ছবি বা ডকুমেন্ট সংযুক্ত করুন
              </button>
              <button className="flex-grow w-full bg-[#009664] text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95">
                <Send size={20} /> 📤 জমা দিন
              </button>
            </div>
          </form>
        </section>

        {/* Process Timeline */}
        <section className="space-y-10">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800 mb-2">অভিযোগ নিষ্পত্তি প্রক্রিয়া</h2>
            <p className="text-slate-500 font-bold text-sm">আমরা যেভাবে কাজ করি</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-200"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {PROCESS_STEPS.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative z-10 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-emerald-500 text-emerald-600 flex items-center justify-center font-black text-xl mx-auto shadow-md">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-800 mb-1">{step.title}</h4>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Guidelines & Commitment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-emerald-50 rounded-[28px] p-8 border border-emerald-100 flex flex-col"
          >
            <h3 className="text-xl font-black text-emerald-900 mb-4 flex items-center gap-2">
              <CheckCircle2 size={24} className="text-emerald-600" />
              আমাদের প্রতিশ্রুতি
            </h3>
            <p className="text-emerald-800 font-bold text-sm leading-relaxed flex-grow">
              আমরা প্রতিটি অভিযোগ ও পরামর্শকে গুরুত্ব সহকারে বিবেচনা করি এবং একটি নিরাপদ, নির্ভরযোগ্য ও তথ্যসমৃদ্ধ প্ল্যাটফর্ম গড়ে তুলতে কাজ করি। আপনার একটি সঠিক মতামত আমাদের আরও এক ধাপ এগিয়ে নিয়ে যায়।
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-800 rounded-[28px] p-8 text-white"
          >
            <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-emerald-400">
              <HelpCircle size={24} />
              গুরুত্বপূর্ণ নির্দেশনা
            </h3>
            <ul className="space-y-3 text-slate-300 font-bold text-xs md:text-sm">
              <li className="flex items-start gap-2">✅ <span className="flex-grow">সঠিক ও সত্য তথ্য প্রদান করুন।</span></li>
              <li className="flex items-start gap-2">✅ <span className="flex-grow">অশালীন, মিথ্যা বা বিভ্রান্তিকর অভিযোগ গ্রহণযোগ্য নয়।</span></li>
              <li className="flex items-start gap-2">✅ <span className="flex-grow">অন্যের ব্যক্তিগত তথ্য অনুমতি ছাড়া শেয়ার করবেন না।</span></li>
              <li className="flex items-start gap-2">✅ <span className="flex-grow">একই বিষয়ে একাধিকবার অভিযোগ পাঠানো থেকে বিরত থাকুন।</span></li>
            </ul>
          </motion.section>
        </div>

        {/* FAQ Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-black text-slate-800 text-center tracking-tight">সাধারণ প্রশ্ন (FAQ)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
              >
                <h4 className="text-sm font-black text-emerald-800 mb-2 flex items-center gap-2">
                  <HelpCircle size={18} /> {faq.q}
                </h4>
                <p className="text-xs text-slate-600 font-bold leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Emergency & Contact Support */}
        <section className="bg-emerald-900 rounded-[40px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -mr-32 -mt-32 opacity-20 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
            <div className="text-center lg:text-left space-y-3">
              <h3 className="text-3xl font-black tracking-tight">জরুরি যোগাযোগ</h3>
              <p className="text-emerald-100 font-bold max-w-md text-sm md:text-base">
                যদি অভিযোগ বা পরামর্শ জমা দিতে কোনো সমস্যা হয় বা বিষয়টি অত্যন্ত জরুরি হয়, সরাসরি যোগাযোগ করুন।
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
                <div className="flex items-center gap-2 bg-emerald-800/50 px-4 py-2 rounded-full border border-emerald-700/50 text-xs font-bold">
                  <Mail size={14} className="text-emerald-400" /> support@amaderputhia.com
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-6 rounded-[32px] text-emerald-900 shadow-xl flex flex-col items-center gap-1 group/call cursor-pointer active:scale-95 transition-all">
                <Phone size={32} className="text-emerald-600 mb-2 group-hover/call:rotate-12 transition-transform" />
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">২৪/৭ কল সেন্টার</span>
                <span className="text-2xl font-black tracking-tighter text-[#01412F]">+৮৮০ ১XXXXXXXXX</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
}


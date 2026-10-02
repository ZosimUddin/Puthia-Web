import React, { useEffect } from "react";
import { motion } from "motion/react";
import { 
  Phone, Mail, MapPin, Clock, Send, 
  HelpCircle, Facebook, Youtube, 
  Instagram, Linkedin, MessageSquare, Globe, Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import BottomNavigation from "../../components/home/BottomNavigation";
import { UnifiedHeroHeader } from "../../components/common/UnifiedDesignSystem";
import SEO from "../../components/SEO";

const FAQS = [
  { q: "আমি কিভাবে একটি ব্যবসা তালিকাভুক্ত করতে পারি?", a: "আমাদের ওয়েবসাইটের 'ব্যবসা ডিরেক্টরি' বিভাগে গিয়ে 'নিবন্ধন করুন' বাটনে ক্লিক করে তথ্য জমা দিন।" },
  { q: "ভুল তথ্য সংশোধনের প্রক্রিয়া কী?", a: "আপনি রিপোর্ট অপশন ব্যবহার করতে পারেন অথবা আমাদের ইমেইলে সঠিক তথ্যসহ আবেদন করুন।" },
  { q: "প্ল্যাটফর্মটি কি সম্পূর্ণ বিনামূল্যে?", a: "হ্যাঁ, সাধারণ তথ্য সেবা ও তালিকাভুক্তি বর্তমানে বিনামূল্যে।" },
  { q: "জরুরি সেবা কিভাবে পাব?", a: "আমাদের 'জরুরি সেবা' মেনুতে ক্লিক করে সংশ্লিষ্ট কর্তৃপক্ষের নম্বর সরাসরি ডায়াল করুন।" },
  { q: "ব্যবসা বা প্রতিষ্ঠান তালিকাভুক্তি?", a: "আমাদের 'ব্যবসা' সেকশনে গিয়ে নতুন ব্যবসা যোগ করার অপশন ব্যবহার করুন।" },
];

export default function ContactPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <SEO 
        title="যোগাযোগ করুন - আমাদের পুঠিয়া"
        description="আমাদের পুঠিয়া প্ল্যাটফর্মের অফিসিয়াল হটলাইন, ইমেইল ও ঠিকানায় সরাসরি যোগাযোগ করুন।"
      />

      <Header />

      {/* Full-width Unified Hero Header */}
      <UnifiedHeroHeader
        title="যোগাযোগ করুন"
        subtitle="আমাদের পুঠিয়া প্ল্যাটফর্মের সাথে যেকোনো তথ্য, সেবা বা সহায়তার প্রয়োজনে সরাসরি যোগাযোগ করুন।"
        badgeText="সরাসরি যোগাযোগ ও সাপোর্ট"
        icon={<MessageSquare size={24} />}
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-40 space-y-12 sm:space-y-16 relative z-10">
        
        {/* Contact Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Phone, title: "মোবাইল", info: "+৮৮০ ১XXXXXXXXX" },
            { icon: Phone, title: "টেলিফোন", info: "+৮৮০-XXX-XXXXXX" },
            { icon: Mail, title: "ইমেইল", info: "info@amaderputhia.com" },
            { icon: MapPin, title: "অফিস", info: "পুঠিয়া উপজেলা, রাজশাহী-৬২৬০" },
            { icon: Globe, title: "ওয়েবসাইট", info: "www.amaderputhia.com" },
            { icon: Clock, title: "অফিস সময়", info: "শনি - বৃহস্পতি (৯টা - ৫টা)" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-slate-100 rounded-[20px] p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <item.icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{item.title}</h4>
                <p className="text-sm font-bold text-slate-800 mt-0.5 break-words whitespace-normal leading-tight">{item.info}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Contact Form & Map */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-slate-100 rounded-[20px] p-5 sm:p-6 shadow-sm lg:col-span-7 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-5 sm:mb-6">আমাদের বার্তা পাঠান</h3>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <input type="text" placeholder="আপনার নাম" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors" />
                <input type="email" placeholder="ইমেইল" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors" />
                <input type="tel" placeholder="মোবাইল নম্বর (ঐচ্ছিক)" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors" />
                <input type="text" placeholder="বিষয়" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors" />
                <textarea placeholder="আপনার বার্তা" rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors" />
                <button className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-700/10 active:scale-[0.98]">
                  <Send size={16} /> বার্তা পাঠান
                </button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-slate-100 rounded-[20px] p-3 shadow-sm overflow-hidden lg:col-span-5 h-[300px] sm:h-[380px] lg:h-full lg:min-h-[420px] flex flex-col"
          >
            <div className="relative w-full h-full rounded-[14px] overflow-hidden flex-1">
              <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.749005085376!2d88.8315180749068!3d24.370390165972847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fb67a0026e6d11%3A0x8e8745c4794e7724!2sPuthia%20Upazila%20Parishad!5e0!3m2!1sen!2sbd!4v1721326462719!5m2!1sen!2sbd" 
                  className="absolute inset-0 w-full h-full border-0 rounded-[14px]" 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="space-y-6 sm:space-y-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 text-center tracking-tight">সাধারণ জিজ্ঞাসা (FAQ)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-white border border-slate-100 rounded-[20px] p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="text-sm sm:text-base font-bold text-emerald-800 mb-2 sm:mb-3 flex items-start gap-2">
                  <HelpCircle size={18} className="shrink-0 mt-0.5 text-emerald-600" /> {faq.q}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Social Links */}
        <section className="text-center bg-emerald-50/70 rounded-[24px] sm:rounded-[30px] p-6 sm:p-10 md:p-12 border border-emerald-100/50">
          <h3 className="font-black text-lg sm:text-2xl text-slate-800 mb-6 sm:mb-8">আমাদের অনুসরণ করুন</h3>
          <div className="flex justify-center gap-4 sm:gap-6 flex-wrap">
            {[Facebook, Youtube, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white border border-emerald-100 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 hover:shadow-lg flex items-center justify-center transition-all">
                <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
              </a>
            ))}
          </div>
        </section>

      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
}

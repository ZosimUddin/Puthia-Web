import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, HelpCircle, ChevronDown, ChevronUp, 
  ThumbsUp, ThumbsDown, MessageCircle, Mail, 
  Phone, ArrowLeft, Globe, ShieldCheck, 
  ShoppingCart, Building2, UserCircle, Settings, Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import BottomNavigation from "../../components/home/BottomNavigation";
import { UnifiedHeroHeader } from "../../components/common/UnifiedDesignSystem";
import SEO from "../../components/SEO";

const FAQ_DATA = [
  {
    id: 1,
    category: "সাধারণ",
    q: '"আমাদের পুঠিয়া" কী?',
    a: '"আমাদের পুঠিয়া" একটি স্মার্ট ডিজিটাল প্ল্যাটফর্ম, যেখানে পুঠিয়া উপজেলার তথ্য, নাগরিক সেবা, ব্যবসা, শিক্ষা, স্বাস্থ্য, পর্যটন, কেনা-বেচা, ভাড়া, খবর এবং বিভিন্ন স্থানীয় সেবা একত্রে পাওয়া যায়।',
    icon: Globe
  },
  {
    id: 2,
    category: "অ্যাকাউন্ট",
    q: "এই প্ল্যাটফর্ম ব্যবহার করতে কি অ্যাকাউন্ট লাগবে?",
    a: "সাধারণ তথ্য দেখার জন্য অ্যাকাউন্ট প্রয়োজন নেই। তবে বিজ্ঞাপন প্রকাশ, প্রিয় তালিকা সংরক্ষণ, মন্তব্য বা কিছু বিশেষ সেবা ব্যবহারের জন্য নিবন্ধন ও লগইন প্রয়োজন হতে পারে।",
    icon: UserCircle
  },
  {
    id: 3,
    category: "কেনা-বেচা",
    q: "আমি কীভাবে কেনা-বেচা বা ভাড়ার বিজ্ঞাপন প্রকাশ করব?",
    a: 'লগইন করার পর "কেনা-বেচা" বা "ভাড়া" বিভাগে গিয়ে "বিজ্ঞাপন দিন" বাটনে ক্লিক করে প্রয়োজনীয় তথ্য পূরণ করুন।',
    icon: ShoppingCart
  },
  {
    id: 4,
    category: "ব্যবসা",
    q: "ব্যবসা বা প্রতিষ্ঠান কীভাবে তালিকাভুক্ত করব?",
    a: '"ব্যবসা ও বাজার" বিভাগে গিয়ে নতুন ব্যবসা বা প্রতিষ্ঠানের তথ্য জমা দিতে পারবেন। যাচাই শেষে তা প্রকাশ করা হবে।',
    icon: Building2
  },
  {
    id: 5,
    category: "সাধারণ",
    q: "কোনো ভুল তথ্য দেখলে কী করব?",
    a: 'প্রতিটি তথ্য বা পেজে থাকা "রিপোর্ট" অথবা "অভিযোগ ও পরামর্শ" অপশনের মাধ্যমে আমাদের জানাতে পারেন।',
    icon: HelpCircle
  },
  {
    id: 6,
    category: "সাধারণ",
    q: "এই প্ল্যাটফর্মের সব তথ্য কি সরকারি?",
    a: "না। কিছু তথ্য সরকারি সূত্র থেকে সংগ্রহ করা হয় এবং কিছু তথ্য ব্যবহারকারী বা স্থানীয় প্রতিষ্ঠান প্রদান করে। তাই প্রয়োজনে তথ্য যাচাই করার পরামর্শ দেওয়া হয়।",
    icon: ShieldCheck
  },
  {
    id: 7,
    category: "সাধারণ",
    q: '"আমাদের পুঠিয়া" কি বিনামূল্যে ব্যবহার করা যাবে?',
    a: "হ্যাঁ। অধিকাংশ তথ্য ও সেবা সম্পূর্ণ বিনামূল্যে ব্যবহার করা যাবে। ভবিষ্যতে কিছু বিশেষ বা প্রিমিয়াম সেবা চালু হলে তা আলাদাভাবে জানানো হবে।",
    icon: HelpCircle
  },
  {
    id: 8,
    category: "প্রযুক্তিগত সহায়তা",
    q: "মোবাইল অ্যাপ আছে কি?",
    a: "বর্তমানে মোবাইল অ্যাপ উন্নয়নাধীন। খুব শীঘ্রই Android ও iOS-এর জন্য অ্যাপ প্রকাশ করা হবে।",
    icon: Settings
  },
  {
    id: 9,
    category: "অ্যাকাউন্ট",
    q: "আমার ব্যক্তিগত তথ্য কি নিরাপদ?",
    a: "হ্যাঁ। আমরা আপনার ব্যক্তিগত তথ্যের গোপনীয়তা ও নিরাপত্তা রক্ষায় যথাযথ ব্যবস্থা গ্রহণ করি। বিস্তারিত জানতে গোপনীয়তা নীতি (Privacy Policy) দেখুন।",
    icon: ShieldCheck
  },
  {
    id: 10,
    category: "সাধারণ",
    q: "কীভাবে যোগাযোগ করব?",
    a: '"যোগাযোগ" অথবা "অভিযোগ ও পরামর্শ" পেজের মাধ্যমে আমাদের সাথে যোগাযোগ করতে পারবেন।',
    icon: Mail
  }
];

const CATEGORIES = ["সব", "সাধারণ", "অ্যাকাউন্ট", "কেনা-বেচা", "ভাড়া", "ব্যবসা", "প্রযুক্তিগত সহায়তা"];

export default function FAQPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("সব");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [helpfulStatus, setHelpfulStatus] = useState<Record<number, boolean | null>>({});

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(faq => {
      const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "সব" || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const toggleAccordion = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleHelpful = (id: number, status: boolean) => {
    setHelpfulStatus(prev => ({ ...prev, [id]: status }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <SEO 
        title="সাধারণ জিজ্ঞাসা (FAQ) - আমাদের পুঠিয়া"
        description="আমাদের পুঠিয়া সম্পর্কে সর্বাধিক জিজ্ঞাসিত প্রশ্ন ও উত্তর।"
      />

      <Header />

      {/* Full-width Unified Hero Header */}
      <UnifiedHeroHeader
        title="সাধারণ জিজ্ঞাসা (FAQ)"
        subtitle="আমাদের পুঠিয়া সম্পর্কে প্রয়োজনীয় তথ্য ও সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্ন ও উত্তর।"
        badgeText="সহায়তা কেন্দ্র"
        icon={<HelpCircle size={24} />}
        showBack={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="আপনার প্রশ্ন খুঁজুন..."
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

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-40 space-y-10 flex-grow w-full relative z-10">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeCategory === cat 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <motion.div
                key={faq.id}
                layout
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <faq.icon size={20} />
                    </div>
                    <span className="text-sm md:text-base font-black text-slate-800 leading-tight">{faq.q}</span>
                  </div>
                  <div className={`shrink-0 transition-transform duration-300 ${expandedId === faq.id ? "rotate-180 text-emerald-600" : "text-slate-400"}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 pt-2 ml-14 border-t border-slate-50">
                        <p className="text-sm text-slate-600 font-bold leading-relaxed mb-6">
                          {faq.a}
                        </p>
                        
                        {/* Helpful Feedback */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">এই উত্তরটি কি সহায়ক ছিল?</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleHelpful(faq.id, true)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                                helpfulStatus[faq.id] === true 
                                ? "bg-emerald-100 text-emerald-700" 
                                : "bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                              }`}
                            >
                              <ThumbsUp size={14} /> হ্যাঁ
                            </button>
                            <button 
                              onClick={() => handleHelpful(faq.id, false)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                                helpfulStatus[faq.id] === false 
                                ? "bg-rose-100 text-rose-700" 
                                : "bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                              }`}
                            >
                              <ThumbsDown size={14} /> না
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-800">কোনো ফলাফল পাওয়া যায়নি</h3>
              <p className="text-sm font-bold text-slate-400">অন্য কোনো কিওয়ার্ড দিয়ে চেষ্টা করুন।</p>
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 text-center space-y-6">
            <h2 className="text-2xl font-black text-slate-800">এখনও উত্তর পাননি?</h2>
            <p className="text-sm font-bold text-slate-500 max-w-md mx-auto">
              আপনার প্রশ্নের উত্তর এখানে না পেলে, সরাসরি আমাদের সাথে যোগাযোগ করুন। আমরা আপনাকে সাহায্য করতে প্রস্তুত।
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm">
                  <Mail size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase">ইমেইল করুন</p>
                  <p className="text-xs font-black text-slate-800">support@amaderputhia.com</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm">
                  <Phone size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase">কল করুন</p>
                  <p className="text-xs font-black text-slate-800">+৮৮০ ১XXXXXXXXX</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={() => navigate('/contact')}
                className="w-full md:w-auto px-8 py-3.5 bg-[#009664] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95"
              >
                <Phone size={18} /> যোগাযোগ করুন
              </button>
              <button 
                onClick={() => navigate('/feedback')}
                className="w-full md:w-auto px-8 py-3.5 bg-white text-emerald-700 border border-emerald-200 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all active:scale-95"
              >
                <MessageCircle size={18} /> অভিযোগ ও পরামর্শ
              </button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
}

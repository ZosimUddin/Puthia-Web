import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, ShieldCheck, Lock, Smartphone, AlertTriangle, CheckCircle2, 
  HelpCircle, ArrowLeft, Search, PhoneCall, FileText, Sparkles, Eye, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../../components/AuthModal';

// @ts-ignore
import puthiaBg from "../../assets/images/puthia_temple_bg_1783616072369.jpg";

export interface SafeGuideItem {
  id: string;
  category: 'cyber' | 'fraud' | 'emergency';
  categoryLabel: string;
  title: string;
  summary: string;
  details: string[];
  warningNote?: string;
}

const GUIDE_CATEGORIES = [
  { id: 'all', label: 'সকল সেফ গাইড', icon: ShieldCheck },
  { id: 'cyber', label: 'সাইবার নিরাপত্তা', icon: Lock },
  { id: 'fraud', label: 'প্রতারণা থেকে সুরক্ষা', icon: ShieldAlert },
  { id: 'emergency', label: 'জরুরি টিপস', icon: AlertTriangle },
];

const GUIDES_DATA: SafeGuideItem[] = [
  {
    id: 'guide-1',
    category: 'cyber',
    categoryLabel: 'সাইবার নিরাপত্তা',
    title: 'শক্তিশালী পাসওয়ার্ড তৈরি ও সংরক্ষণ করার উপায়',
    summary: 'আপনার ফেসবুক, জিমেইল ও ব্যাংক অ্যাকাউন্ট সুরক্ষায় শক্তিশালী পাসওয়ার্ড ব্যবহারের নিয়ম।',
    details: [
      'কমপক্ষে ৮ থেকে ১২ অক্ষরের পাসওয়ার্ড ব্যবহার করুন যাতে বড় ও ছোট হাতের অক্ষর, সংখ্যা এবং স্পেশাল ক্যারেক্টার (!@#$%) মিশ্রিত থাকে।',
      'একই পাসওয়ার্ড একাধিক ওয়েবসাইটে ব্যবহার করা থেকে বিরত থাকুন।',
      'টু-ফ্যাক্টর অথেন্টিকেশন (2FA) বা দ্বি-ধাপ যাচাইকরণ সবসময় চালু রাখুন।',
      'কখনো কারো সাথে আপনার পাসওয়ার্ড বা ওটিপি (OTP) শেয়ার করবেন না।'
    ],
    warningNote: 'মনে রাখবেন: ব্যাংক কর্মকর্তা বা কোনো সেবা প্রতিনিধি কখনো আপনার পাসওয়ার্ড বা ওটিপি চাইবেন না।'
  },
  {
    id: 'guide-2',
    category: 'fraud',
    categoryLabel: 'প্রতারণা থেকে সুরক্ষা',
    title: 'বিকাশ/নগদ বা মোবাইল ব্যাংকিং পিন ও ওটিপি প্রতারণা রোধ',
    summary: 'লটারি জেতার লোভ দেখিয়ে বা বিকাশ অ্যাকাউন্ট লক হয়ে যাওয়ার ভুয়াCalls থেকে বাঁচার উপায়।',
    details: [
      'অপরিচিত নম্বর থেকে কল করে লটারি জেতা বা উপহার পাঠানোর কথা বললে বিশ্বাস করবেন না।',
      'মোবাইল ব্যাংকিং পিন (PIN) এবং ওটিপি (OTP) একান্তই আপনার গোপনীয় বিষয়। এটি অন্য কাউকে বলা মানে আপনার একাউন্টের নিয়ন্ত্রণ তুলে দেওয়া।',
      'ভুয়া কাস্টমার কেয়ার সেজে কল করলে तुरंत কল কেটে দিন এবং অফিশিয়াল নম্বরে যোগাযোগ করুন।',
      'সন্দেহজনক লিঙ্কে ক্লিক করে ব্যক্তিগত তথ্য বা পাসওয়ার্ড ইনপুট করবেন না।'
    ],
    warningNote: 'সতর্ক থাকুন: প্রতারকরা প্রায়ই নিজেদের র‍্যাব, পুলিশ বা বিকাশ হেড অফিসের কর্মকর্তা পরিচয় দিয়ে ভয় দেখায়।'
  },
  {
    id: 'guide-3',
    category: 'fraud',
    categoryLabel: 'প্রতারণা থেকে সুরক্ষা',
    title: 'অনলাইন শপিং ও ভুয়া ই-কমার্স পেজ থেকে সাবধানতা',
    summary: 'সোশ্যাল মিডিয়ার লোভনীয় অফার ও কম দামে পণ্য বিক্রির নামে প্রতারণা থেকে বাঁচার কৌশল।',
    details: [
      'অপরিচিত বা নতুন ফেসবুক পেজ থেকে পণ্য অর্ডার করার আগে তাদের পেজের রিভিউ ও কমেন্টস যাচাই করুন।',
      'অযৌক্তিকভাবে অনেক কম দামে ব্র্যান্ডের পণ্য বিক্রির অফার দেখলে সতর্ক হোন।',
      'সম্ভব হলে ক্যাশ অন ডেলিভারি (Cash on Delivery) অপশন বেছে নিন।',
      'অগ্রিম টাকা পাঠানোর আগে প্রতিষ্ঠানের অফিসিয়াল ওয়েবসাইট বা ঠিকানা নিশ্চিত করুন।'
    ]
  },
  {
    id: 'guide-4',
    category: 'cyber',
    categoryLabel: 'সাইবার নিরাপত্তা',
    title: 'স্মার্টফোন ও সোশ্যাল মিডিয়া অ্যাকাউন্ট হ্যাকিং প্রতিরোধ',
    summary: 'ফেসবুক আইডি ক্লোনিং বা হ্যাকিং থেকে রক্ষা পাওয়ার কার্যকরী উপায়।',
    details: [
      'ফেসবুকে অপরিচিত মানুষের পাঠানো অজানা লিঙ্কে ক্লিক করা থেকে বিরত থাকুন।',
      'ফিশিং সাইট সম্পর্কে ধারণা রাখুন—যেগুলো দেখতে ফেসবুক বা জিমেইলের মতো হলেও ইউআরএল ভিন্ন হয়।',
      'আপনার ডিভাইসে অ্যান্টিভাইরাস বা সিকিউরিটি অ্যাপ আপডেট রাখুন।',
      'পাবলিক ওয়াইফাই (Public Wi-Fi) ব্যবহারে সংবেদনশীল অ্যাকাউন্ট লগইন করা এড়িয়ে চলুন।'
    ]
  },
  {
    id: 'guide-5',
    category: 'emergency',
    categoryLabel: 'জরুরি টিপস',
    title: 'জরুরি মুহূর্তে করণীয় ও পুলিশের সহায়তা নেওয়া',
    summary: 'যেকোনো বিপদে তাৎক্ষণিকভাবে আইনি সহায়তা ও জরুরি সেবা পাওয়ার উপায়।',
    details: [
      'জরুরি প্রয়োজনে অবিলম্বে জাতীয় জরুরি সেবা নম্বর ৯৯৯ (999)-এ কল করুন।',
      'সাইবার ক্রাইম বা অনলাইনে হয়রানির শিকার হলে সিআইডি সাইবার পুলিশ সেল (Cyber Police Bangladesh)-এর সাথে যোগাযোগ করুন।',
      'স্থানীয় পুঠিয়া থানা বা পৌরসভা কার্যালয়ের হেল্পলাইন নম্বর মোবাইলে সংরক্ষণ রাখুন।'
    ],
    warningNote: 'জরুরি পুলিশ সহায়তা পেতে টোল-ফ্রি ৯৯৯ নম্বরে দিন-রাত ২৪ ঘণ্টা কল করতে পারেন।'
  }
];

export const SafeGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('guide-1');

  const filteredGuides = GUIDES_DATA.filter(guide => {
    const matchesCat = selectedCategory === 'all' || guide.category === selectedCategory;
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          guide.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          guide.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafcfb] flex flex-col font-sans">
      <Header 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onSearch={() => {}} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(path) => {
          setIsSidebarOpen(false);
          navigate(path.startsWith('/') ? path : `/${path}`);
        }} 
      />

      <main className="flex-1 pb-24">
        <div className="animate-fade-in font-sans">
          
          {/* Top Banner Header */}
          <div 
            className="p-5 sm:p-7 rounded-b-[32px] text-white relative overflow-hidden mb-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)' }}
          >
            <div 
              className="absolute inset-0 opacity-[0.05] bg-cover bg-center pointer-events-none" 
              style={{ backgroundImage: `url(${puthiaBg})` }} 
            />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <button 
                onClick={() => navigate('/exclusive-features')} 
                className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition flex items-center justify-center cursor-pointer text-white"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> ১০০% সুরক্ষিত গাইডলাইন
                </span>
              </div>
            </div>

            <div className="relative z-10 max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                সেফ গাইড (Safe Guide & Cyber Security)
              </h1>
              <p className="text-xs sm:text-sm text-teal-100 font-medium leading-relaxed">
                সাইবার নিরাপত্তা, অনলাইন প্রতারণা থেকে বাঁচার উপায় এবং দৈনন্দিন জীবনে নিরাপত্তার জরুরি টিপস।
              </p>
            </div>

            {/* Quick Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/15 relative z-10">
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-3 border border-white/10">
                <Lock size={20} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">সাইবার নিরাপত্তা</span>
                  <span className="text-[10px] text-teal-200">ডিজিটাল অ্যাকাউন্ট সুরক্ষা</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-3 border border-white/10">
                <ShieldAlert size={20} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">প্রতারণা রোধ</span>
                  <span className="text-[10px] text-teal-200">ভুয়া কল ও স্ক্যাম থেকে বাঁচুন</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-3 border border-white/10">
                <AlertTriangle size={20} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">জরুরি টিপস</span>
                  <span className="text-[10px] text-teal-200">৯৯৯ ও আইনি সহায়তা</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 max-w-4xl mx-auto space-y-5">

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="নিরাপত্তা টিপস বা প্রতারণা থেকে বাঁচার উপায় খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 outline-none shadow-2xs"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {GUIDE_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer border ${
                      isActive 
                        ? 'bg-teal-700 text-white border-teal-700 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent size={15} className={isActive ? 'text-white' : 'text-teal-700'} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Guides List */}
            <div className="space-y-4">
              {filteredGuides.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-2xs space-y-3">
                  <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">কোনো গাইড বা টিপস পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-500 mt-1">অন্য কোনো কীওয়ার্ড দিয়ে অনুসন্ধান করুন।</p>
                  </div>
                </div>
              ) : (
                filteredGuides.map((guide) => {
                  const isExpanded = expandedId === guide.id;

                  return (
                    <motion.div
                      key={guide.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 hover:border-teal-300 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-100 inline-block">
                            {guide.categoryLabel}
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-slate-800 leading-snug">
                            {guide.title}
                          </h3>
                        </div>

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : guide.id)}
                          className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                        >
                          {isExpanded ? 'সংক্ষিপ্ত করুন' : 'বিস্তারিত পড়ুন'}
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {guide.summary}
                      </p>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-700"
                          >
                            <div className="space-y-2">
                              {guide.details.map((point, idx) => (
                                <div key={idx} className="flex items-start gap-2.5">
                                  <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                                  <span className="leading-relaxed">{point}</span>
                                </div>
                              ))}
                            </div>

                            {guide.warningNote && (
                              <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 flex items-start gap-3 text-amber-900 mt-3">
                                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="block font-bold">বিশেষ সতর্কবার্তা:</strong>
                                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{guide.warningNote}</p>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Emergency Hotline Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-3xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base font-black text-white flex items-center justify-center sm:justify-start gap-2">
                  <PhoneCall size={20} className="text-emerald-500" /> সাইবার ক্রাইম বা প্রতারণার শিকার হয়েছেন?
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  তাত্ক্ষণিক সহযোগিতার জন্য জাতীয় জরুরি সেবা ৯৯৯ অথবা পুঠিয়া থানায় যোগাযোগ করুন।
                </p>
              </div>
              <button
                onClick={() => navigate('/emergency')}
                className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-xl text-xs shadow-md transition cursor-pointer whitespace-nowrap"
              >
                জরুরি হেল্পলাইন নম্বর
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default SafeGuidePage;

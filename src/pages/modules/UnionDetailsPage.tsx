import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Users, MapPin, ArrowLeft, Globe, History, 
  Map as MapIcon, GraduationCap, HeartPulse, Wheat, Store,
  Download, Image as ImageIcon, Video, HelpCircle, PhoneCall,
  ChevronDown, ExternalLink, ShieldCheck, Mail, Clock,
  Star, Share2, FileText, CloudSun, Calendar, Newspaper,
  AlertTriangle, Play
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';

const UNION_DETAILS_FALLBACK: Record<string, any> = {
  "1": {
    name: "১নং পুঠিয়া ইউনিয়ন",
    enName: "Puthia",
    about: "পুঠিয়া উপজেলার সদর ইউনিয়ন হিসেবে পুঠিয়া ইউনিয়ন অত্যন্ত গুরুত্বপূর্ণ। প্রাচীন রাজবাড়ি, মঠ ও মন্দিরের জন্য এটি বিখ্যাত।",
    history: "প্রাচীনকাল থেকেই পুঠিয়া একটি সমৃদ্ধ জনপদ। পুঠিয়া রাজবংশের শাসনামলে এখানকার অবকাঠামোগত ব্যাপক উন্নয়ন ঘটে।",
    established: "১৯৭৩ সাল",
    area: "১৮.৫ বর্গ কি.মি.",
    population: { total: "৩৫,০০০", male: "১৭,২০০", female: "১৭,৮০০", families: "৮,৫০০" },
    location: "পুঠিয়া উপজেলা সদর থেকে ১ কি.মি. দূরে অবস্থিত।",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14502.949704257134!2d88.8262!3d24.3644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fc177f10b75a1d%3A0x8f2d5e9d9d3000!2sPuthia%2C%20Bangladesh!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus",
    parishad: {
      chairman: "মোঃ খলিলুর রহমান",
      secretary: "মোঃ আব্দুল কাদের",
      members: "১২ জন",
      hours: "সকাল ৯:০০ - বিকাল ৫:০০"
    },
    education: { schools: "১৫টি", colleges: "২টি", madrasa: "৫টি" },
    health: { clinics: "৩টি", hospital: "১টি", pharmacy: "২০+" },
    religious: { mosques: "৩৫টি", temples: "১০টি" },
    agriculture: { crop: "ধান, আম, গম", office: "উপজেলা কৃষি অফিস সংলগ্ন" },
    market: { hat: "২টি", bazar: "৫টি" },
    offices: ["ভূমি অফিস", "ডাকঘর", "ইউনিয়ন পরিষদ"],
    weather: { temp: "২৮°C", condition: "আংশিক মেঘলা", humidity: "৬৫%" },
    emergencyContacts: [
      { name: "চেয়ারম্যান", phone: "01711-000001", role: "ইউনিয়ন পরিষদ" },
      { name: "সচিব", phone: "01711-000011", role: "ইউনিয়ন পরিষদ" },
      { name: "কমিউনিটি পুলিশ", phone: "01711-000111", role: "আইনশৃঙ্খলা" },
      { name: "পল্লী বিদ্যুৎ", phone: "01711-001111", role: "বিদ্যুৎ অফিস" }
    ],
    gallery: {
      photos: [
        "https://images.unsplash.com/photo-1596700543632-15f5c9e2b0fa?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1588667635677-440409a656db?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1623910384877-a859c22822a1?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1610017130548-c923d3a0c793?auto=format&fit=crop&w=600&q=80"
      ],
      videos: [
        { title: "ইউনিয়নের উন্নয়নমূলক কাজ", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
      ]
    },
    downloads: [
      { title: "ইউনিয়ন প্রোফাইল ২০২৩", size: "২.৪ MB", type: "pdf" },
      { title: "বাজেট রিপোর্ট", size: "১.২ MB", type: "pdf" },
      { title: "নাগরিক সনদ ফর্ম", size: "৪৫০ KB", type: "doc" }
    ],
    news: [
      { title: "কৃষকদের মাঝে বিনামূল্যে সার বিতরণ", date: "১৫ মে, ২০২৩", excerpt: "উপজেলা কৃষি অফিসের উদ্যোগে পুঠিয়া ইউনিয়নের কৃষকদের মাঝে বিনামূল্যে সার ও বীজ বিতরণ করা হয়েছে।" },
      { title: "নতুন রাস্তা উদ্বোধন", date: "১০ মে, ২০২৩", excerpt: "ইউনিয়ন পরিষদের চেয়ারম্যান নতুন সংযোগ সড়কের উদ্বোধন করেন।" }
    ],
    events: [
      { title: "ফ্রি মেডিকেল ক্যাম্প", date: "২০ মে, ২০২৩", location: "ইউনিয়ন পরিষদ প্রাঙ্গণ" },
      { title: "কৃষি মেলা", date: "২৫ মে, ২০২৩", location: "পুঠিয়া স্কুল মাঠ" }
    ],
    faqs: [
      { q: "নাগরিক সনদ পেতে কী করতে হবে?", a: "নাগরিক সনদের জন্য চেয়ারম্যান বরাবর আবেদন করতে হবে। সাথে জাতীয় পরিচয়পত্রের ফটোকপি ও ছবি যুক্ত করতে হবে।" },
      { q: "ইউনিয়ন পরিষদের অফিস সময় কখন?", a: "সরকারি ছুটি ব্যতীত রবিবার থেকে বৃহস্পতিবার সকাল ৯:০০ টা থেকে বিকাল ৫:০০ টা পর্যন্ত খোলা থাকে।" },
      { q: "জমির খতিয়ান তোলার নিয়ম কী?", a: "ইউনিয়ন ভূমি অফিসে প্রয়োজনীয় ফি প্রদান সাপেক্ষে নির্দিষ্ট ফর্ম পূরণ করে আবেদন করতে হবে।" }
    ]
  }
};

const UnionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [union, setUnion] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, 'union_profiles', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Merge with fallback to ensure all sections are populated
          setUnion({ ...UNION_DETAILS_FALLBACK["1"], ...data });
        } else {
          setUnion(UNION_DETAILS_FALLBACK[id] || UNION_DETAILS_FALLBACK["1"]);
        }
      } catch (e) {
        console.error("Error loading union details", e);
        setUnion(UNION_DETAILS_FALLBACK[id || "1"] || UNION_DETAILS_FALLBACK["1"]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${union?.name} | পুঠিয়া উপজেলা`,
          text: `পুঠিয়া উপজেলার ${union?.name} সম্পর্কে বিস্তারিত জানুন।`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      alert("আপনার ডিভাইসে শেয়ার অপশন সমর্থিত নয়। লিংকটি কপি করুন: " + window.location.href);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!union) {
    return <div className="min-h-screen flex items-center justify-center">তথ্য পাওয়া যায়নি</div>;
  }

  const tabs = [
    { id: "overview", label: "পরিচিতি", icon: <Globe size={16} /> },
    { id: "parishad", label: "ইউনিয়ন পরিষদ", icon: <Building2 size={16} /> },
    { id: "stats", label: "পরিসংখ্যান", icon: <Users size={16} /> },
    { id: "news", label: "সংবাদ ও ইভেন্ট", icon: <Newspaper size={16} /> },
    { id: "gallery", label: "গ্যালারি", icon: <ImageIcon size={16} /> },
    { id: "downloads", label: "ডাউনলোড", icon: <Download size={16} /> },
    { id: "faq", label: "জিজ্ঞাসা", icon: <HelpCircle size={16} /> },
    { id: "map", label: "মানচিত্র", icon: <MapIcon size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans flex flex-col w-full max-w-full overflow-x-hidden">
      <Header />
      {/* Page Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-black text-slate-900 tracking-wide flex items-center gap-2 line-clamp-1">
              {union.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsFavorite(!isFavorite)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-full transition-colors">
              <Star size={20} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button onClick={handleShare} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Share2 size={20} />
            </button>
            <button onClick={handlePrint} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <FileText size={20} />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex overflow-x-auto gap-1 scrollbar-none border-t border-slate-100 pt-2 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Tab Content: Overview */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Live Weather Widget & Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100">
                  <Globe size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-4">এক নজরে {union.name}</h2>
                <p className="text-slate-700 leading-relaxed font-medium mb-6">
                  {union.about}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                    <History size={20} className="text-slate-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">ইতিহাস</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{union.history}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                    <MapPin size={20} className="text-slate-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">অবস্থান</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{union.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather & Quick Stats */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-3xl shadow-md text-white">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black flex items-center gap-2"><CloudSun size={18} /> আবহাওয়া</h3>
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">লাইভ</span>
                  </div>
                  <div className="text-4xl font-black mb-1">{union.weather?.temp}</div>
                  <div className="text-sm font-medium text-blue-100">{union.weather?.condition}</div>
                  <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm">
                    <span className="font-medium text-blue-100">আর্দ্রতা</span>
                    <span className="font-bold">{union.weather?.humidity}</span>
                  </div>
                </div>

                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                  <h3 className="font-black text-rose-900 mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-rose-600" /> জরুরি যোগাযোগ
                  </h3>
                  <div className="space-y-3">
                    {union.emergencyContacts?.map((contact: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-rose-100 shadow-sm">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{contact.name}</p>
                          <p className="text-xs text-slate-500">{contact.role}</p>
                        </div>
                        <a href={`tel:${contact.phone}`} className="w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors">
                          <PhoneCall size={14} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* Tab Content: Parishad */}
        {activeTab === "parishad" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" /> জনপ্রতিনিধি ও প্রশাসন
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600 mb-1">চেয়ারম্যান</p>
                    <h4 className="font-black text-slate-900">{union.parishad?.chairman}</h4>
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm shrink-0">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">সচিব</p>
                    <h4 className="font-black text-slate-900">{union.parishad?.secretary}</h4>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500 mb-1">ইউপি সদস্য</p>
                  <p className="font-bold text-slate-800">{union.parishad?.members}</p>
                </div>
                <div className="p-4 border border-slate-100 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500 mb-1">অফিস সময়</p>
                  <p className="font-bold text-slate-800">{union.parishad?.hours}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
               <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="text-slate-500" /> গুরুত্বপূর্ণ অফিস
              </h3>
              <div className="flex flex-wrap gap-2">
                {union.offices?.map((office: string, idx: number) => (
                  <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold">
                    {office}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Content: Stats */}
        {activeTab === "stats" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Users className="text-blue-500" /> জনসংখ্যা ও পরিবার
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl text-center">
                  <p className="text-xs font-bold text-blue-600 mb-1">মোট জনসংখ্যা</p>
                  <p className="font-black text-slate-900 text-xl">{union.population?.total}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <p className="text-xs font-bold text-slate-500 mb-1">পুরুষ</p>
                  <p className="font-black text-slate-900 text-xl">{union.population?.male}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <p className="text-xs font-bold text-slate-500 mb-1">নারী</p>
                  <p className="font-black text-slate-900 text-xl">{union.population?.female}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <p className="text-xs font-bold text-slate-500 mb-1">পরিবার</p>
                  <p className="font-black text-slate-900 text-xl">{union.population?.families}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="text-indigo-500" /> শিক্ষা প্রতিষ্ঠান
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-sm font-medium text-slate-700">
                    <span>প্রাথমিক ও মাধ্যমিক বিদ্যালয়</span>
                    <span className="font-bold bg-slate-100 px-2 py-1 rounded-md">{union.education?.schools}</span>
                  </li>
                  <li className="flex justify-between items-center text-sm font-medium text-slate-700">
                    <span>কলেজ</span>
                    <span className="font-bold bg-slate-100 px-2 py-1 rounded-md">{union.education?.colleges}</span>
                  </li>
                  <li className="flex justify-between items-center text-sm font-medium text-slate-700">
                    <span>মাদ্রাসা</span>
                    <span className="font-bold bg-slate-100 px-2 py-1 rounded-md">{union.education?.madrasa}</span>
                  </li>
                </ul>
              </div>

              {/* Health */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                  <HeartPulse className="text-rose-500" /> স্বাস্থ্যসেবা
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-sm font-medium text-slate-700">
                    <span>কমিউনিটি ক্লিনিক</span>
                    <span className="font-bold bg-slate-100 px-2 py-1 rounded-md">{union.health?.clinics}</span>
                  </li>
                  <li className="flex justify-between items-center text-sm font-medium text-slate-700">
                    <span>হাসপাতাল</span>
                    <span className="font-bold bg-slate-100 px-2 py-1 rounded-md">{union.health?.hospital}</span>
                  </li>
                  <li className="flex justify-between items-center text-sm font-medium text-slate-700">
                    <span>ফার্মেসি</span>
                    <span className="font-bold bg-slate-100 px-2 py-1 rounded-md">{union.health?.pharmacy}</span>
                  </li>
                </ul>
              </div>

              {/* Agriculture */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Wheat className="text-amber-500" /> কৃষি
                </h3>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600"><span className="font-bold text-slate-800">প্রধান ফসল:</span> {union.agriculture?.crop}</p>
                  <p className="text-sm font-medium text-slate-600"><span className="font-bold text-slate-800">কৃষি অফিস:</span> {union.agriculture?.office}</p>
                </div>
              </div>

              {/* Markets */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Store className="text-orange-500" /> হাট ও বাজার
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-sm font-medium text-slate-700">
                    <span>বড় হাট</span>
                    <span className="font-bold bg-slate-100 px-2 py-1 rounded-md">{union.market?.hat}</span>
                  </li>
                  <li className="flex justify-between items-center text-sm font-medium text-slate-700">
                    <span>স্থানীয় বাজার</span>
                    <span className="font-bold bg-slate-100 px-2 py-1 rounded-md">{union.market?.bazar}</span>
                  </li>
                </ul>
              </div>
            </div>
            
          </motion.div>
        )}

        {/* Tab Content: News & Events */}
        {activeTab === "news" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* News */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Newspaper className="text-blue-500" /> স্থানীয় সংবাদ
                </h3>
                <div className="space-y-4">
                  {union.news?.map((item: any, idx: number) => (
                    <div key={idx} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <p className="text-xs font-bold text-blue-600 mb-1">{item.date}</p>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">{item.title}</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{item.excerpt}</p>
                    </div>
                  ))}
                  {(!union.news || union.news.length === 0) && <p className="text-slate-500 text-sm">কোনো সংবাদ নেই।</p>}
                </div>
              </div>

              {/* Events */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Calendar className="text-amber-500" /> আসন্ন ইভেন্ট
                </h3>
                <div className="space-y-4">
                  {union.events?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center border border-slate-200 shrink-0">
                        <span className="text-xs font-bold text-slate-500 uppercase">{item.date.split(' ')[1]}</span>
                        <span className="text-lg font-black text-amber-500 leading-none">{item.date.split(' ')[0]}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12}/> {item.location}</p>
                      </div>
                    </div>
                  ))}
                  {(!union.events || union.events.length === 0) && <p className="text-slate-500 text-sm">কোনো ইভেন্ট নেই।</p>}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Tab Content: Gallery */}
        {activeTab === "gallery" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Photos */}
            <div>
              <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                <ImageIcon className="text-emerald-500" /> স্থিরচিত্র
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {union.gallery?.photos?.map((photo: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm group relative">
                    <img src={photo} alt="Gallery item" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
                {(!union.gallery?.photos || union.gallery.photos.length === 0) && <p className="text-slate-500 text-sm col-span-full">কোনো ছবি নেই।</p>}
              </div>
            </div>

            {/* Videos */}
            <div>
              <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                <Video className="text-rose-500" /> ভিডিও গ্যালারি
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {union.gallery?.videos?.map((video: any, idx: number) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <iframe 
                      src={video.url} 
                      title={video.title} 
                      className="w-full aspect-video" 
                      allowFullScreen
                      style={{ border: 0 }}
                    ></iframe>
                    <div className="p-4 bg-white">
                      <p className="font-bold text-sm text-slate-800">{video.title}</p>
                    </div>
                  </div>
                ))}
                {(!union.gallery?.videos || union.gallery.videos.length === 0) && <p className="text-slate-500 text-sm col-span-full">কোনো ভিডিও নেই।</p>}
              </div>
            </div>

          </motion.div>
        )}

        {/* Tab Content: Downloads */}
        {activeTab === "downloads" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Download className="text-blue-500" /> গুরুত্বপূর্ণ ডাউনলোড
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {union.downloads?.map((doc: any, idx: number) => (
                  <button key={idx} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors group">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 border border-slate-200 shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm mb-0.5 group-hover:text-blue-600 transition-colors">{doc.title}</p>
                        <p className="text-xs text-slate-500 font-medium">{doc.type.toUpperCase()} • {doc.size}</p>
                      </div>
                    </div>
                    <Download size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </button>
                ))}
                {(!union.downloads || union.downloads.length === 0) && <p className="text-slate-500 text-sm">কোনো ফাইল নেই।</p>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Content: FAQ */}
        {activeTab === "faq" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <HelpCircle className="text-emerald-500" /> সাধারণ জিজ্ঞাসা
              </h3>
              <div className="space-y-3">
                {union.faqs?.map((faq: any, idx: number) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                    <button 
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left focus:outline-none hover:bg-slate-100 transition-colors"
                    >
                      <span className="font-bold text-sm text-slate-800 pr-4">{faq.q}</span>
                      <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {expandedFaq === idx && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-200/50 bg-white">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                {(!union.faqs || union.faqs.length === 0) && <p className="text-slate-500 text-sm">কোনো তথ্য নেই।</p>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Content: Map */}
        {activeTab === "map" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               {union.mapUrl ? (
                 <iframe 
                   src={union.mapUrl}
                   width="100%" 
                   height="500" 
                   style={{ border: 0, borderRadius: '1.5rem' }} 
                   allowFullScreen 
                   loading="lazy" 
                   referrerPolicy="no-referrer-when-downgrade"
                   title="Union Map"
                 ></iframe>
               ) : (
                 <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-3xl text-slate-400">
                   <MapIcon size={48} className="mb-4 opacity-50" />
                   <p className="font-bold">মানচিত্র উপলব্ধ নয়</p>
                 </div>
               )}
            </div>
          </motion.div>
        )}

      </div>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default UnionDetailsPage;

import React, { useState, useEffect } from 'react';
import { copyToClipboard } from '../../utils/clipboard';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Map, CheckCircle, ExternalLink, HelpCircle, ChevronDown, ChevronUp, 
  AlertCircle, Info, FileText, Search, BookOpen, Calculator, Edit3, MapPin, Phone, 
  Coins, Landmark, Calendar, Scale, Download, Star, Share2, Globe, Check, PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Puthiya Unions & Mouzas data for interactive features
const PUTHIYA_UNIONS = [
  { id: "puthia_municipality", name: "পুঠিয়া পৌরসভা", mouzas: [
    { jl: 87, name: "পুঠিয়া", totalPlots: 1450, totalAcres: 345.2 },
    { jl: 88, name: "গোপালপুর", totalPlots: 820, totalAcres: 198.4 },
    { jl: 92, name: "তারাপুর", totalPlots: 620, totalAcres: 112.5 }
  ]},
  { id: "puthia_union", name: "১নং পুঠিয়া ইউনিয়ন", mouzas: [
    { jl: 89, name: "জেঠিয়া", totalPlots: 1120, totalAcres: 289.1 },
    { jl: 90, name: "কৃষ্ণপুর", totalPlots: 940, totalAcres: 210.3 },
    { jl: 91, name: "বিড়ালদহ", totalPlots: 1560, totalAcres: 412.7 }
  ]},
  { id: "jiupara", name: "২নং জিউপাড়া ইউনিয়ন", mouzas: [
    { jl: 102, name: "জিউপাড়া", totalPlots: 1380, totalAcres: 320.4 },
    { jl: 103, name: "ধাদাশ", totalPlots: 1250, totalAcres: 290.8 }
  ]},
  { id: "bhalukgachi", name: "৩নং ভালুকগাছী ইউনিয়ন", mouzas: [
    { jl: 115, name: "ভালুকগাছী", totalPlots: 1850, totalAcres: 450.6 },
    { jl: 116, name: "ধোকড়াকুল", totalPlots: 1410, totalAcres: 310.2 }
  ]},
  { id: "belpukur", name: "৪নং বেলপুকুরিয়া ইউনিয়ন", mouzas: [
    { jl: 125, name: "বেলপুকুরিয়া", totalPlots: 2100, totalAcres: 520.4 },
    { jl: 126, name: "ভড়ুয়াপাড়া", totalPlots: 1150, totalAcres: 265.3 }
  ]},
  { id: "baneswar", name: "৫নং বানেশ্বর ইউনিয়ন", mouzas: [
    { jl: 135, name: "বানেশ্বর", totalPlots: 2200, totalAcres: 490.5 },
    { jl: 136, name: "খুটিপাড়া", totalPlots: 1320, totalAcres: 280.2 }
  ]},
  { id: "silmaria", name: "৬নং শিলমাড়ীয়া ইউনিয়ন", mouzas: [
    { jl: 145, name: "শিলমাড়ীয়া", totalPlots: 2450, totalAcres: 610.8 },
    { jl: 146, name: "সাধনপুর", totalPlots: 1680, totalAcres: 385.4 }
  ]}
];

// Mock Land Registry Records for Interactive Search
const MOCK_LAND_RECORDS: Array<{
  khatian: string;
  dag: string;
  mouza: string;
  ownerName: string;
  fatherName: string;
  share: string;
  area: string; // in decimals
  class: string;
}> = [
  { khatian: "৪৫২", dag: "১২০৪", mouza: "পুঠিয়া", ownerName: "আব্দুর রহমান সরদার", fatherName: "মৃত করিম সরদার", share: "০.৫০০", area: "১৮.৫", class: "ভিটা" },
  { khatian: "৪৫২", dag: "১২০৫", mouza: "পুঠিয়া", ownerName: "মোছাঃ ফাতেমা খাতুন", fatherName: "আব্দুর রহমান সরদার", share: "০.৫০০", area: "১২.২", class: "ধানী" },
  { khatian: "১০৮৫", dag: "৭৪২", mouza: "বিড়ালদহ", ownerName: "মোঃ হাসিবুল ইসলাম", fatherName: "মোঃ আলতাফ আলী", share: "১.০০০", area: "৪৫.০", class: "বাগান" },
  { khatian: "২২৪", dag: "১৯০", mouza: "জিউপাড়া", ownerName: "শ্রী বিমল চন্দ্র সরকার", fatherName: "মৃত নীলকণ্ঠ সরকার", share: "০.৭৫০", area: "২২.৮", class: "নাল" },
  { khatian: "২২৪", dag: "১৯১", mouza: "জিউপাড়া", ownerName: "শ্রীমতী রাধী রানী সরকার", fatherName: "শ্রী বিমল চন্দ্র সরকার", share: "০.২৫০", area: "৭.৬", class: "পুকুর" },
  { khatian: "৬১২", dag: "৮৮৫", mouza: "বানেশ্বর", ownerName: "মোঃ জুলফিকার আলী", fatherName: "মৃত মফিজ উদ্দিন", share: "১.০০০", area: "১৬.৪", class: "ভিটা" },
  { khatian: "১৪০২", dag: "২৪১০", mouza: "শিলমাড়ীয়া", ownerName: "মোছাঃ আয়েশা সিদ্দিকা", fatherName: "মৃত সামসুদ্দিন প্রামাণিক", share: "০.৬০০", area: "৩০.০", class: "ধানী" },
  { khatian: "১৪০২", dag: "২৪১১", mouza: "শিলমাড়ীয়া", ownerName: "মোঃ রফিকুল ইসলাম", fatherName: "মৃত সামসুদ্দিন প্রামাণিক", share: "০.৪০০", area: "২০.০", class: "বাগান" }
];

export default function LandServicesPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  // Search through all land categories
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  
  // Tab systems for individual card details
  const [khatianTab, setKhatianTab] = useState<'search' | 'types' | 'verify' | 'guide'>('search');
  const [mouzaTab, setMouzaTab] = useState<'view' | 'download' | 'jl' | 'info' | 'guide'>('view');
  const [namjariTab, setNamjariTab] = useState<'apply' | 'status' | 'fees' | 'docs' | 'faq'>('apply');
  const [taxTab, setTaxTab] = useState<'pay' | 'calc' | 'receipt' | 'dues' | 'guide'>('pay');

  // Interactive Form States
  const [khatianSearchForm, setKhatianSearchForm] = useState({ union: '', mouza: '', khatianNo: '', dagNo: '' });
  const [khatianSearchResults, setKhatianSearchResults] = useState<typeof MOCK_LAND_RECORDS>([]);
  const [khatianSearched, setKhatianSearched] = useState(false);

  const [jlSearchQuery, setJlSearchQuery] = useState('');
  const [jlSearchResults, setJlSearchResults] = useState<Array<{ union: string, name: string, jl: number, totalPlots: number, totalAcres: number }>>([]);

  const [namjariApplyForm, setNamjariApplyForm] = useState({ name: '', nid: '', phone: '', mouza: '', dag: '', khatian: '', area: '', desc: '' });
  const [namjariSubmitted, setNamjariSubmitted] = useState(false);
  const [namjariAppId, setNamjariAppId] = useState('');
  const [statusSearchId, setStatusSearchId] = useState('');
  const [statusResult, setStatusResult] = useState<string | null>(null);

  const [taxCalcForm, setTaxCalcForm] = useState({ landClass: 'agricultural', areaSize: '' });
  const [taxCalcResult, setTaxCalcResult] = useState<number | null>(null);
  const [taxPayForm, setTaxPayForm] = useState({ mobile: '', nid: '', dob: '', holding: '' });
  const [taxPaidStatus, setTaxPaidStatus] = useState<string | null>(null);

  const [dagSearchForm, setDagSearchForm] = useState({ union: '', mouza: '', dagNo: '' });
  const [dagSearchResults, setDagSearchResults] = useState<typeof MOCK_LAND_RECORDS>([]);
  const [dagSearched, setDagSearched] = useState(false);

  const [feeCalcForm, setFeeCalcForm] = useState({ value: '', relation: 'others' });
  const [feeCalcResult, setFeeCalcResult] = useState<{ stamp: number, reg: number, localTax: number, sourceTax: number, total: number } | null>(null);

  const [appointmentForm, setAppointmentForm] = useState({ name: '', phone: '', purpose: '', office: 'upazila', date: '', time: '' });
  const [appointmentStatus, setAppointmentStatus] = useState<string | null>(null);

  // General Interactive States (Favorites & Share)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('puthia_land_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync favorites
  useEffect(() => {
    localStorage.setItem('puthia_land_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Deep linking to selected card based on url params
  useEffect(() => {
    if (category) {
      if (category === "khatian" || category === "porcha") setSelectedCard("khatian");
      else if (category === "mouza" || category === "mouza-map") setSelectedCard("mouza");
      else if (category === "namjari" || category === "mutation") setSelectedCard("namjari");
      else if (category === "tax" || category === "land-tax") setSelectedCard("tax");
      else if (category === "dag") setSelectedCard("dag");
      else if (category === "record") setSelectedCard("record");
      else if (category === "office") setSelectedCard("office");
      else if (category === "ac") setSelectedCard("ac");
      else if (category === "law") setSelectedCard("law");
      else if (category === "calculator") setSelectedCard("calculator");
      else if (category === "appointment") setSelectedCard("appointment");
      else if (category === "faq") setSelectedCard("faq");
    }
  }, [category]);

  const toggleFavorite = (cardId: string) => {
    if (favorites.includes(cardId)) {
      setFavorites(favorites.filter(id => id !== cardId));
      showToast("পছন্দের তালিকা থেকে সরানো হয়েছে");
    } else {
      setFavorites([...favorites, cardId]);
      showToast("পছন্দের তালিকায় সংরক্ষণ করা হয়েছে");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const shareService = async (cardId: string, title: string) => {
    const shareUrl = `${window.location.origin}/land/${cardId}`;
    if (navigator.share) {
      navigator.share({
        title: `স্মার্ট ভূমি সেবা - ${title}`,
        text: `আমাদের পুঠিয়া অনলাইন পোর্টালের মাধ্যমে ${title} সেবার বিস্তারিত গাইডলাইন ও অনলাইন সুবিধা দেখে নিন।`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      await copyToClipboard(shareUrl);
      showToast("শেয়ার লিংকটি ক্লিপবোর্ডে কপি করা হয়েছে!");
    }
  };

  // 12 Cards Configuration
  const cards = [
    {
      id: "khatian",
      title: "খতিয়ান",
      subtitle: "CS, RS, SA, BS খতিয়ান ও পর্চা অনুসন্ধান এবং ডাউনলোড",
      icon: <FileText className="w-7 h-7 text-yellow-600" />,
      bg: "bg-yellow-50 hover:bg-yellow-100/70 border-yellow-100",
      colorCode: "#B45309"
    },
    {
      id: "mouza",
      title: "🗺️ মৌজা ম্যাপ",
      subtitle: "পুঠিয়া উপজেলার মৌজা ম্যাপ অনুসন্ধান ও নকশা সংগ্রহ",
      icon: <Map className="w-7 h-7 text-purple-600" />,
      bg: "bg-purple-50 hover:bg-purple-100/70 border-purple-100",
      colorCode: "#7C3AED"
    },
    {
      id: "namjari",
      title: "✍️ নামজারি",
      subtitle: "অনলাইনে ই-নামজারি আবেদন, ফি প্রদান ও ট্র্যাকিং",
      icon: <Edit3 className="w-7 h-7 text-emerald-600" />,
      bg: "bg-emerald-50 hover:bg-emerald-100/70 border-emerald-100",
      colorCode: "#059669"
    },
    {
      id: "tax",
      title: "💰 ভূমি উন্নয়ন কর",
      subtitle: "অনলাইনে খাজনা প্রদান, হিসাব এবং দাখিলা ডাউনলোড",
      icon: <Coins className="w-7 h-7 text-blue-600" />,
      bg: "bg-blue-50 hover:bg-blue-100/70 border-blue-100",
      colorCode: "#2563EB"
    },
    {
      id: "dag",
      title: "📍 দাগ নম্বর অনুসন্ধান",
      subtitle: "নির্দিষ্ট মৌজার দাগ নম্বর দিয়ে জমির মালিক ও বিবরণ খুঁজুন",
      icon: <MapPin className="w-7 h-7 text-red-600" />,
      bg: "bg-red-50 hover:bg-red-100/70 border-red-100",
      colorCode: "#DC2626"
    },
    {
      id: "record",
      title: "📄 পর্চা/রেকর্ড",
      subtitle: "ভূমি রেকর্ড রুম থেকে সার্টিফাইড মূল পর্চা বা রেকর্ড প্রাপ্তি",
      icon: <FileText className="w-7 h-7 text-teal-600" />,
      bg: "bg-teal-50 hover:bg-teal-100/70 border-teal-100",
      colorCode: "#0D9488"
    },
    {
      id: "office",
      title: "🧭 ভূমি অফিস লোকেশন",
      subtitle: "পুঠিয়া উপজেলার সকল ইউনিয়ন ও পৌর ভূমি অফিসের ম্যাপ লোকেশন ও যোগাযোগ",
      icon: <Landmark className="w-7 h-7 text-indigo-600" />,
      bg: "bg-indigo-50 hover:bg-indigo-100/70 border-indigo-100",
      colorCode: "#4F46E5"
    },
    {
      id: "ac",
      title: "📞 সহকারী কমিশনার (ভূমি)",
      subtitle: "উপজেলা সহকারী কমিশনার (ভূমি) এবং দায়িত্বপ্রাপ্ত কর্মকর্তাদের যোগাযোগ",
      icon: <Phone className="w-7 h-7 text-amber-600" />,
      bg: "bg-amber-50 hover:bg-amber-100/70 border-amber-100",
      colorCode: "#D97706"
    },
    {
      id: "law",
      title: "📋 ভূমি আইন ও নির্দেশিকা",
      subtitle: "গুরুত্বপূর্ণ ভূমি আইন, দলিলের বিবরণ এবং আইনি সমাধান গাইড",
      icon: <Scale className="w-7 h-7 text-rose-600" />,
      bg: "bg-rose-50 hover:bg-rose-100/70 border-rose-100",
      colorCode: "#E11D48"
    },
    {
      id: "calculator",
      title: "💵 ফি ক্যালকুলেটর",
      subtitle: "জমি ক্রয়-বিক্রয় ও দলিলের আনুমানিক রেজিস্ট্রেশন সরকারি ফি হিসাব",
      icon: <Calculator className="w-7 h-7 text-cyan-600" />,
      bg: "bg-cyan-50 hover:bg-cyan-100/70 border-cyan-100",
      colorCode: "#0891B2"
    },
    {
      id: "appointment",
      title: "📅 সিরিয়াল/অ্যাইস্টারমেন্ট",
      subtitle: "শুনানি বা যেকোনো ভূমি পরামর্শের জন্য সরকারি অ্যাইস্টারমেন্ট বুকিং",
      icon: <Calendar className="w-7 h-7 text-orange-600" />,
      bg: "bg-orange-50 hover:bg-orange-100/70 border-orange-100",
      colorCode: "#EA580C"
    },
    {
      id: "faq",
      title: "❓ সাধারণ প্রশ্ন (FAQ)",
      subtitle: "জমি পরিমাপ, বিরোধ নিষ্পত্তি ও ডিজিটাল ভূমি সেবা সংক্রান্ত প্রশ্ন উত্তর",
      icon: <HelpCircle className="w-7 h-7 text-slate-600" />,
      bg: "bg-slate-50 hover:bg-slate-100 border-slate-100",
      colorCode: "#475569"
    }
  ];

  // Search filter
  const filteredCards = cards.filter(card => 
    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Interactive functions
  const handleKhatianSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKhatianSearched(true);
    // Filter mock records
    const results = MOCK_LAND_RECORDS.filter(rec => {
      let match = true;
      if (khatianSearchForm.mouza && rec.mouza !== khatianSearchForm.mouza) match = false;
      if (khatianSearchForm.khatianNo && rec.khatian !== khatianSearchForm.khatianNo) match = false;
      if (khatianSearchForm.dagNo && rec.dag !== khatianSearchForm.dagNo) match = false;
      return match;
    });
    setKhatianSearchResults(results);
  };

  const handleJlSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const results: typeof jlSearchResults = [];
    PUTHIYA_UNIONS.forEach(union => {
      union.mouzas.forEach(mouza => {
        if (mouza.name.includes(jlSearchQuery) || String(mouza.jl).includes(jlSearchQuery)) {
          results.push({
            union: union.name,
            name: mouza.name,
            jl: mouza.jl,
            totalPlots: mouza.totalPlots,
            totalAcres: mouza.totalAcres
          });
        }
      });
    });
    setJlSearchResults(results);
  };

  const handleNamjariApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namjariApplyForm.name || !namjariApplyForm.nid || !namjariApplyForm.phone) {
      alert("অনুগ্রহ করে আপনার নাম, এনআইডি এবং মোবাইল নম্বর লিখুন।");
      return;
    }
    const randId = "MUT-" + Math.floor(100000 + Math.random() * 900000);
    setNamjariAppId(randId);
    setNamjariSubmitted(true);
    showToast("ই-নামজারি আবেদন সফলভাবে দাখিল হয়েছে!");
  };

  const checkNamjariStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusSearchId) return;
    if (statusSearchId.startsWith("MUT-")) {
      setStatusResult("আবেদনপত্রটি পুঠিয়া সহকারী কমিশনার (ভূমি) কার্যালয়ে শুনানির অপেক্ষায় রয়েছে। শুনানি গ্রহণের তারিখ খুব শীঘ্রই এসএমএস-এর মাধ্যমে জানিয়ে দেওয়া হবে।");
    } else {
      setStatusResult("দুঃখিত, এই আবেদন আইডিটি খুঁজে পাওয়া যায়নি। সঠিক আইডি লিখুন (যেমন: MUT-123456)");
    }
  };

  const calculateTax = (e: React.FormEvent) => {
    e.preventDefault();
    const size = parseFloat(taxCalcForm.areaSize);
    if (isNaN(size) || size <= 0) return;
    
    let rate = 3; // default agricultural 3 tk per decimal
    if (taxCalcForm.landClass === 'commercial') rate = 150;
    else if (taxCalcForm.landClass === 'residential') rate = 40;
    else if (taxCalcForm.landClass === 'industrial') rate = 200;

    setTaxCalcResult(size * rate);
  };

  const handleTaxPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxPayForm.mobile || !taxPayForm.nid || !taxPayForm.holding) return;
    setTaxPaidStatus("processing");
    setTimeout(() => {
      setTaxPaidStatus("success");
      showToast("ভূমি কর সম্পূর্ণ সফলভাবে পরিশোধিত হয়েছে!");
    }, 1500);
  };

  const handleDagSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDagSearched(true);
    const results = MOCK_LAND_RECORDS.filter(rec => {
      let match = true;
      if (dagSearchForm.mouza && rec.mouza !== dagSearchForm.mouza) match = false;
      if (dagSearchForm.dagNo && rec.dag !== dagSearchForm.dagNo) match = false;
      return match;
    });
    setDagSearchResults(results);
  };

  const calculateFees = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(feeCalcForm.value);
    if (isNaN(val) || val <= 0) return;

    const stamp = Math.round(val * 0.015); // 1.5% Stamp Duty
    const reg = Math.round(val * 0.01); // 1% Registration fee
    const localTax = Math.round(val * 0.02); // 2% Local Govt Tax
    const sourceTax = feeCalcForm.relation === 'inheritance' ? 0 : Math.round(val * 0.03); // 3% Source Tax

    setFeeCalcResult({
      stamp,
      reg,
      localTax,
      sourceTax,
      total: stamp + reg + localTax + sourceTax
    });
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentForm.name || !appointmentForm.phone || !appointmentForm.date) return;
    setAppointmentStatus("success");
    showToast("সিরিয়াল বুকিং সম্পন্ন হয়েছে!");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans text-slate-800 antialiased selection:bg-emerald-200">
      
      {/* Top Header Banner */}
      <div className="bg-[#5C3A21] text-white px-4 pt-6 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#7C4D3A] rounded-full filter blur-2xl opacity-40 -mr-16 -mt-16"></div>
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-[#3E2723] rounded-full filter blur-xl opacity-30 -ml-12 -mb-12"></div>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <button 
              onClick={() => {
                if (selectedCard) {
                  setSelectedCard(null);
                  navigate('/services/land');
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full text-xs font-bold transition duration-200 cursor-pointer text-white"
            >
              <ArrowLeft size={14} strokeWidth={2.5} /> {selectedCard ? "অন্যান্য সেবা" : "হোম পেইজ"}
            </button>
            <div className="flex items-center gap-1.5 bg-yellow-500/20 px-3.5 py-1 rounded-full text-yellow-300 text-xs font-extrabold border border-yellow-500/30 uppercase tracking-wider animate-pulse">
              🏛️ স্মার্ট ভূমি ডিরেক্টরি
            </div>
          </div>

          <div className="relative z-10 space-y-2 text-center md:text-left mt-6">
            <p className="text-yellow-400 text-xs font-extrabold tracking-widest uppercase">ভূমি মন্ত্রণালয়, গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">ভূমি ও সম্পত্তি সেবা গাইড</h1>
            <p className="text-white/80 text-xs md:text-sm max-w-xl leading-relaxed">
              পুঠিয়া উপজেলা ভূমি অফিস ও ডিজিটাল সেবাের সমন্বিত গেটওয়ে। খতিয়ান, মৌজা ম্যাপ, ই-নামজারি এবং ভূমি কর সংক্রান্ত সকল সেবা এখন আপনার হাতের মুঠোয়।
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-20 space-y-6">
        
        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 z-[99] border border-white/10"
            >
              <Check size={14} className="text-emerald-400" strokeWidth={3} /> {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Search and Info Bar - Only visible when NO card is selected */}
        {!selectedCard && (
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/75 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="খতিয়ান, নামজারি, কর বা মৌজা ম্যাপ সেবা খুঁজুন..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5C3A21]/30 transition"
              />
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold shrink-0 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
              <Info size={14} className="text-amber-600 animate-spin" /> মোট ১২টি ডিজিটাল ভূমি সেবা উপলব্ধ
            </div>
          </div>
        )}

        {/* Dynamic Detail Panels System */}
        {selectedCard ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left side: Tab contents and forms (Spans 2 columns on desktop) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Category Header Card */}
              <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {cards.find(c => c.id === selectedCard)?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{cards.find(c => c.id === selectedCard)?.title}</h2>
                    <p className="text-xs text-slate-500 font-bold mt-1 leading-relaxed">{cards.find(c => c.id === selectedCard)?.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* CARD 1 CONTENT: KHATIAN */}
              {selectedCard === "khatian" && (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                  {/* Category sub-navigation */}
                  <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {[
                      { id: 'search', label: '🔍 খতিয়ান অনুসন্ধান' },
                      { id: 'types', label: '📂 খতিয়ানের প্রকারভেদ' },
                      { id: 'verify', label: '✅ খতিয়ান যাচাই' },
                      { id: 'guide', label: '📖 নির্দেশিকা' }
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setKhatianTab(tab.id as any)}
                        className={`px-5 py-3.5 text-xs font-black border-b-2 transition cursor-pointer ${khatianTab === tab.id ? 'border-[#5C3A21] text-[#5C3A21] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    {khatianTab === 'search' && (
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
                          <p className="text-xs text-slate-600 font-bold leading-relaxed">
                            💡 <span className="text-[#B45309]">ইন্টারেক্টিভ ডেমো:</span> নিচের যেকোনো একটি মৌজা নির্বাচন করুন অথবা খতিয়ান নম্বর <span className="font-extrabold text-slate-900">৪৫২</span> বা <span className="font-extrabold text-slate-900">১০৮৫</span> দিয়ে সার্চ করে টেস্ট ডাটা দেখুন।
                          </p>
                        </div>

                        <form onSubmit={handleKhatianSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-black text-slate-600 mb-1.5">ইউনিয়ন বা পৌরসভা</label>
                            <select 
                              value={khatianSearchForm.union || ""}
                              onChange={(e) => setKhatianSearchForm({...khatianSearchForm, union: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none"
                            >
                              <option value="">নির্বাচন করুন</option>
                              {PUTHIYA_UNIONS.map(u => <option key={u.id} value={u.name || ""}>{u.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-black text-slate-600 mb-1.5">মৌজার নাম</label>
                            <select 
                              value={khatianSearchForm.mouza || ""}
                              onChange={(e) => setKhatianSearchForm({...khatianSearchForm, mouza: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none"
                            >
                              <option value="">নির্বাচন করুন</option>
                              <option value="পুঠিয়া">পুঠিয়া (JL-87)</option>
                              <option value="গোপালপুর">গোপালপুর (JL-88)</option>
                              <option value="বিড়ালদহ">বিড়ালদহ (JL-91)</option>
                              <option value="জিউপাড়া">জিউপাড়া (JL-102)</option>
                              <option value="বানেশ্বর">বানেশ্বর (JL-135)</option>
                              <option value="শিলমাড়ীয়া">শিলমাড়ীয়া (JL-145)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-black text-slate-600 mb-1.5">খতিয়ান নম্বর (ঐচ্ছিক)</label>
                            <input 
                              type="text" 
                              placeholder="যেমন: ৪৫২"
                              value={khatianSearchForm.khatianNo || ""}
                              onChange={(e) => setKhatianSearchForm({...khatianSearchForm, khatianNo: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black text-slate-600 mb-1.5">দাগ নম্বর (ঐচ্ছিক)</label>
                            <input 
                              type="text" 
                              placeholder="যেমন: ১২০৪"
                              value={khatianSearchForm.dagNo || ""}
                              onChange={(e) => setKhatianSearchForm({...khatianSearchForm, dagNo: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <button type="submit" className="sm:col-span-2 w-full bg-[#5C3A21] text-white rounded-xl py-3 text-xs font-black transition cursor-pointer hover:bg-[#4E311B] mt-2 shadow-md">
                            খতিয়ান খুঁজুন
                          </button>
                        </form>

                        {khatianSearched && (
                          <div className="mt-6 pt-6 border-t border-slate-100">
                            <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                              📋 অনুসন্ধান ফলাফল ({khatianSearchResults.length})
                            </h3>
                            {khatianSearchResults.length > 0 ? (
                              <div className="space-y-3">
                                {khatianSearchResults.map((rec, i) => (
                                  <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 mb-1.5">
                                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">খতিয়ান নং: {rec.khatian}</span>
                                      <span className="text-xs font-black text-slate-500">মৌজা: {rec.mouza}</span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-bold"><span className="text-slate-400">মালিকের নাম:</span> {rec.ownerName}</p>
                                    <p className="text-xs text-slate-700 font-bold"><span className="text-slate-400">পিতা/স্বামীর নাম:</span> {rec.fatherName}</p>
                                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-bold text-slate-600">
                                      <div>দাগ নম্বর: <span className="text-slate-900 font-black">{rec.dag}</span></div>
                                      <div>জমির শ্রেণী: <span className="text-slate-900 font-black">{rec.class}</span></div>
                                      <div>অংশ পরিমাণ: <span className="text-slate-900 font-black">{rec.area} শতক</span></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="text-xs font-bold">দুঃখিত, কোনো ম্যাচিং রেকর্ড খুঁজে পাওয়া যায়নি।</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {khatianTab === 'types' && (
                      <div className="space-y-4">
                        {[
                          { title: "সিএস খতিয়ান (CS - Cadastral Survey)", year: "১৮৮৮ - ১৯৪০", desc: "ভারতবর্ষের প্রথম বৈজ্ঞানিক পদ্ধতিতে প্রস্তুতকৃত খতিয়ান। ব্রিটিশ সরকারের তত্ত্বাবধানে মূলত জমিদারদের খাজনা আদায়ের সুবিধার্থে এটি তৈরি হয়েছিল।" },
                          { title: "এসএ খতিয়ান (SA - State Acquisition)", year: "১৯৫৬ - ১৯৬২", desc: "জমিদারি প্রথা বিলুপ্ত হওয়ার পর পূর্ব পাকিস্তান সরকার দ্বারা সংক্ষেপে জরুরি ভিত্তিতে প্রণীত খতিয়ান। এটি পিএস খতিয়ান নামেও পরিচিত।" },
                          { title: "আরএস খতিয়ান (RS - Revisional Survey)", year: "১৯৬৫ - চলমান", desc: "সিএস এবং এসএ খতিয়ানের মারাত্মক ত্রুটি সংশোধন এবং আধুনিক নকশা অনুযায়ী নিখুঁত পরিমাপের লক্ষ্যে এটি চলমান রয়েছে।" },
                          { title: "বিএস খতিয়ান (BS - Bangladesh Survey)", year: "১৯৯০ - বর্তমান", desc: "আধুনিক স্বাধীন বাংলাদেশের আধুনিক জরিপ পদ্ধতি ও ডিজিটাল নকশা অনুযায়ী প্রতিটি মৌজার সর্বশেষ প্রস্তুতকৃত ডিজিটাল ডাটাবেজ সম্বলিত খতিয়ান।" }
                        ].map((type, i) => (
                          <div key={i} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                            <h4 className="text-xs font-black text-[#5C3A21] flex justify-between">
                              <span>{type.title}</span>
                              <span className="text-slate-400 font-bold">{type.year}</span>
                            </h4>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5">{type.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {khatianTab === 'verify' && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500 font-bold">আপনার ই-পর্চা বা খতিয়ানের অনলাইন কপির সত্যতা এবং অফিসিয়াল ডাটাবেজ যাচাইয়ের জন্য নিচে রেফারেন্স নম্বর লিখে সাবমিট করুন।</p>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                          <div>
                            <label className="block text-xs font-black text-slate-600 mb-1">যাচাই আইডি / খতিয়ান বারকোড নম্বর</label>
                            <input type="text" placeholder="যেমন: EP-485293-2024" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none" />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => showToast("আপনার খতিয়ানটি সরকারি ডাটাবেজে সঠিক ও বৈধ হিসেবে প্রমাণিত হয়েছে।")}
                            className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-black transition cursor-pointer hover:bg-emerald-700"
                          >
                            অনলাইন কপি ভেরিফাই করুন
                          </button>
                        </div>
                      </div>
                    )}

                    {khatianTab === 'guide' && (
                      <div className="space-y-4 leading-relaxed text-xs text-slate-600 font-medium">
                        <div className="flex gap-3 items-start">
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-[#B45309] font-black text-xs flex items-center justify-center shrink-0">১</div>
                          <p>প্রথমে জাতীয় ভূমি তথ্য পোর্টাল (eporcha.gov.bd) এ প্রবেশ করুন এবং খতিয়ান অনুসন্ধান ট্যাব নির্বাচন করুন।</p>
                        </div>
                        <div className="flex gap-3 items-start">
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-[#B45309] font-black text-xs flex items-center justify-center shrink-0">২</div>
                          <p>আপনার বিভাগ (রাজশাহী), জেলা (রাজশাহী), উপজেলা (পুঠিয়া) এবং সংশ্লিষ্ট ইউনিয়ন/পৌরসভার মৌজার নাম নির্বাচন করুন।</p>
                        </div>
                        <div className="flex gap-3 items-start">
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-[#B45309] font-black text-xs flex items-center justify-center shrink-0">৩</div>
                          <p>খতিয়ান নম্বর অথবা দাগ নম্বর অথবা মালিকের নাম টাইপ করুন। নিরাপত্তা ক্যাপচা কোডটি পূরণ করে অনুসন্ধান বাটনে ক্লিক করুন।</p>
                        </div>
                        <div className="flex gap-3 items-start">
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-[#B45309] font-black text-xs flex items-center justify-center shrink-0">৪</div>
                          <p>অনলাইন কপি অবিলম্বে ডাউনলোড করার জন্য বা সরকারি সীলমোহর সহ সার্টিফাইড কপির আবেদন করার জন্য নির্দিষ্ট ১০০ টাকা সরকারি ফি পেমেন্ট গেটওয়ের মাধ্যমে পরিশোধ করুন।</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CARD 2 CONTENT: MOUZA MAP */}
              {selectedCard === "mouza" && (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {[
                      { id: 'view', label: '🗺️ মৌজা ম্যাপ দেখুন' },
                      { id: 'download', label: '📥 ম্যাপ ডাউনলোড' },
                      { id: 'jl', label: '🔍 JL নম্বর অনুসন্ধান' },
                      { id: 'info', label: 'ℹ️ মৌজার তথ্য ও গাইড' }
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setMouzaTab(tab.id as any)}
                        className={`px-5 py-3.5 text-xs font-black border-b-2 transition cursor-pointer ${mouzaTab === tab.id ? 'border-[#5C3A21] text-[#5C3A21] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    {mouzaTab === 'view' && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500 font-bold">পুঠিয়া উপজেলার মৌজা ম্যাপের স্যাম্পল লেআউট। যেকোনো একটি ইউনিয়নে ক্লিক করে ম্যাপ ও জরিপের মোট প্লট ডাটা দেখে নিন।</p>
                        <div className="space-y-3">
                          {PUTHIYA_UNIONS.map((union, idx) => (
                            <div key={idx} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 hover:bg-slate-100/50 transition">
                              <h4 className="text-xs font-black text-slate-800 mb-2">{union.name}</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {union.mouzas.map((m, i) => (
                                  <button 
                                    key={i} 
                                    onClick={() => showToast(`${m.name} মৌজার (JL-${m.jl}) ডিজিটাল নকশা প্রস্তুত রয়েছে। ম্যাপ নম্বর ও সিট বুক করার নির্দেশিকা দেখুন।`)}
                                    className="bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 p-2.5 rounded-xl border border-slate-150 text-left transition cursor-pointer"
                                  >
                                    <p className="text-xs font-extrabold">{m.name}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-bold">JL নম্বর: {m.jl}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">প্লট সংখ্যা: {m.totalPlots}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {mouzaTab === 'download' && (
                      <div className="space-y-4 text-center py-6">
                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                          <Map className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-sm font-black text-slate-800">অনলাইনে মৌজা ম্যাপ বা শিট অর্ডার গাইড</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
                          ভূমি মন্ত্রণালয়ের পোর্টালে নির্দিষ্ট ৫২০ টাকা ফি এবং ডাক যোগাযোগের খরচ প্রদান করে মূল নকশার সার্টিফাইড প্রিন্ট কপি সরাসরি নিজের ঠিকানায় সংগ্রহ করতে পারবেন।
                        </p>
                        <a 
                          href="https://eporcha.gov.bd/map-search" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-2 bg-[#5C3A21] hover:bg-[#4E311B] text-white text-xs font-black px-5 py-3 rounded-xl shadow-md transition"
                        >
                          অফিসিয়াল পোর্টাল থেকে ম্যাপ অর্ডার করুন <ExternalLink size={14} />
                        </a>
                      </div>
                    )}

                    {mouzaTab === 'jl' && (
                      <div className="space-y-4">
                        <form onSubmit={handleJlSearch} className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="মৌজার নাম বা JL নম্বর দিয়ে খুঁজুন..." 
                            value={jlSearchQuery || ""}
                            onChange={(e) => setJlSearchQuery(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                          />
                          <button type="submit" className="bg-[#5C3A21] text-white px-4 rounded-xl text-xs font-black cursor-pointer hover:bg-[#4E311B]">
                            সার্চ
                          </button>
                        </form>

                        {jlSearchResults.length > 0 ? (
                          <div className="space-y-2">
                            {jlSearchResults.map((m, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                  <p className="text-xs font-black text-slate-800">{m.name} মৌজা</p>
                                  <p className="text-[10px] text-slate-400 font-bold">{m.union}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-extrabold text-[#7C3AED]">JL নম্বর: {m.jl}</p>
                                  <p className="text-[10px] text-slate-400 font-bold">মোট এলাকা: {m.totalAcres} একর</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : jlSearchQuery ? (
                          <p className="text-center py-4 text-xs font-bold text-slate-400">কোনো ফলাফল পাওয়া যায়নি।</p>
                        ) : null}
                      </div>
                    )}

                    {mouzaTab === 'info' && (
                      <div className="space-y-4 leading-relaxed text-xs text-slate-600 font-medium">
                        <h4 className="text-xs font-black text-slate-800">📌 জে এল (JL) নম্বর কী?</h4>
                        <p>Jurisdiction List (জে এল) নম্বর হলো প্রতিটি স্বাধীন মৌজার একটি নির্দিষ্ট ভৌগোলিক সূচক পরিচিতি নম্বর। জমি রেজিস্ট্রেশন বা পর্চা উত্তোলনে এই নম্বর অত্যন্ত গুরুত্বপূর্ণ ভূমিকা রাখে।</p>
                        <h4 className="text-xs font-black text-slate-800">📌 মৌজা ম্যাপ বা শিট যেভাবে সাহায্য করে:</h4>
                        <p>নকশার মাধ্যমে জমির সঠিক চতুঃসীমা, পাশের দাগের সাথে সংযোগস্থল, এবং সরকারি রাস্তা বা নদীর অবস্থান স্পষ্টভাবে পরিমাপ করা যায়, যা জমি বিরোধ মীমাংসায় মূল প্রমাণ হিসেবে কাজ করে।</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CARD 3 CONTENT: NAMJARI */}
              {selectedCard === "namjari" && (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {[
                      { id: 'apply', label: '✍️ অনলাইনে আবেদন' },
                      { id: 'status', label: '🔍 আবেদন স্ট্যাটাস' },
                      { id: 'fees', label: '💵 ফি ও পেমেন্ট তথ্য' },
                      { id: 'docs', label: '📄 প্রয়োজনীয় কাগজপত্র' },
                      { id: 'faq', label: '❓ FAQ' }
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setNamjariTab(tab.id as any)}
                        className={`px-5 py-3.5 text-xs font-black border-b-2 transition cursor-pointer ${namjariTab === tab.id ? 'border-[#5C3A21] text-[#5C3A21] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    {namjariTab === 'apply' && (
                      <div className="space-y-4">
                        {!namjariSubmitted ? (
                          <form onSubmit={handleNamjariApply} className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <p className="text-xs text-[#059669] font-bold">ই-নামজারি বা মিউটেশনের জন্য পুঠিয়া উপজেলা ভূমি অফিসে অনলাইনে আবেদন করতে নিচের ডেমো ফরমটি পূরণ করুন।</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-black text-slate-600 mb-1.5">আবেদনকারীর নাম *</label>
                                <input 
                                  type="text" 
                                  required
                                  placeholder="যেমন: মোঃ জসিম উদ্দিন"
                                  value={namjariApplyForm.name || ""}
                                  onChange={(e) => setNamjariApplyForm({...namjariApplyForm, name: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-black text-slate-600 mb-1.5">এনআইডি নম্বর *</label>
                                <input 
                                  type="text" 
                                  required
                                  placeholder="যেমন: ৩২৫৯৪১২০৫৬"
                                  value={namjariApplyForm.nid || ""}
                                  onChange={(e) => setNamjariApplyForm({...namjariApplyForm, nid: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-black text-slate-600 mb-1.5">মোবাইল নম্বর *</label>
                                <input 
                                  type="tel" 
                                  required
                                  placeholder="যেমন: ০১৭১২৩৪৫৬৭৮"
                                  value={namjariApplyForm.phone || ""}
                                  onChange={(e) => setNamjariApplyForm({...namjariApplyForm, phone: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-black text-slate-600 mb-1.5">মৌজার নাম</label>
                                <input 
                                  type="text" 
                                  placeholder="যেমন: পুঠিয়া"
                                  value={namjariApplyForm.mouza || ""}
                                  onChange={(e) => setNamjariApplyForm({...namjariApplyForm, mouza: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-black text-slate-600 mb-1.5">দাগ নং ও খতিয়ান নং</label>
                                <input 
                                  type="text" 
                                  placeholder="যেমন: দাগ ১২০৪, খতিয়ান ৪৫২"
                                  value={namjariApplyForm.dag || ""}
                                  onChange={(e) => setNamjariApplyForm({...namjariApplyForm, dag: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-black text-slate-600 mb-1.5">জমির মোট পরিমাণ (শতক)</label>
                                <input 
                                  type="text" 
                                  placeholder="যেমন: ১৫.৫"
                                  value={namjariApplyForm.area || ""}
                                  onChange={(e) => setNamjariApplyForm({...namjariApplyForm, area: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                />
                              </div>
                            </div>
                            <button type="submit" className="w-full bg-[#5C3A21] hover:bg-[#4E311B] text-white py-3 rounded-xl text-xs font-black transition cursor-pointer">
                              অনলাইন নামজারি আবেদন সাবমিট করুন
                            </button>
                          </form>
                        ) : (
                          <div className="text-center py-6 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                              <CheckCircle className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800">আবেদন সফলভাবে সাবমিট হয়েছে!</h3>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-w-sm mx-auto space-y-1.5">
                              <p className="text-xs font-bold text-slate-500">আপনার ট্র্যাকিং আইডি:</p>
                              <p className="text-lg font-black text-slate-800 tracking-wider">{namjariAppId}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">ভবিষ্যত ট্র্যাকিং এবং শুনানির আপডেটের জন্য আইডিটি সংরক্ষণ করুন।</p>
                            </div>
                            <button 
                              onClick={() => {
                                setNamjariSubmitted(false);
                                setNamjariApplyForm({ name: '', nid: '', phone: '', mouza: '', dag: '', khatian: '', area: '', desc: '' });
                              }}
                              className="text-xs font-black text-[#5C3A21] hover:underline"
                            >
                              নতুন আবেদন করুন
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {namjariTab === 'status' && (
                      <div className="space-y-4">
                        <form onSubmit={checkNamjariStatus} className="space-y-3">
                          <label className="block text-xs font-black text-slate-600">আবেদন ট্র্যাকিং আইডি লিখুন</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              required
                              placeholder="যেমন: MUT-123456" 
                              value={statusSearchId || ""}
                              onChange={(e) => setStatusSearchId(e.target.value)}
                              className="flex-1 bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                            />
                            <button type="submit" className="bg-[#5C3A21] text-white px-4 rounded-xl text-xs font-black hover:bg-[#4E311B] cursor-pointer">
                              চেক স্ট্যাটাস
                            </button>
                          </div>
                        </form>

                        {statusResult && (
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-bold leading-relaxed text-slate-700">
                            {statusResult}
                          </div>
                        )}
                      </div>
                    )}

                    {namjariTab === 'fees' && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500 font-bold mb-2">ই-নামজারির জন্য সরকার নির্ধারিত ফি-এর তালিকা নিচে দেওয়া হলো। এই ফির বাইরে অতিরিক্ত কোনো চার্জ প্রদান করবেন না।</p>
                        {[
                          { service: "আবেদন ফি (অনলাইন)", amount: "২০ টাকা" },
                          { service: "নোটিশ জারি ফি (অনলাইন)", amount: "৫০ টাকা" },
                          { service: "রেকর্ড সংশোধন ফি", amount: "১,০০০ টাকা" },
                          { service: "নতুন খতিয়ান সরবরাহ ফি", amount: "১০০ টাকা" },
                          { service: "সর্বমোট সরকারি ফি", amount: "১,১৭০ টাকা", highlight: true }
                        ].map((fee, i) => (
                          <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${fee.highlight ? 'bg-emerald-50 border-emerald-200 font-black text-emerald-800 text-xs' : 'bg-slate-50 border-slate-100 text-xs text-slate-700 font-bold'}`}>
                            <span>{fee.service}</span>
                            <span>{fee.amount}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {namjariTab === 'docs' && (
                      <div className="space-y-2">
                        {[
                          "১. আবেদনকারীর পাসপোর্ট সাইজের রঙিন ছবি ও জাতীয় পরিচয়পত্র (NID)।",
                          "২. জমি ক্রয়ের রেজিস্ট্রি সাব-কবলা দলিলের কপি।",
                          "৩. পূর্ববর্তী খতিয়ান বা হালনাগাদ পর্চার কপি (CS/RS/SA/BS)।",
                          "৪. উত্তরাধিকার সূত্রে প্রাপ্ত জমির ক্ষেত্রে ওয়ারিশন সার্টিফিকেট (অনধিক ৩ মাসের)।",
                          "৫. হাল সনের ভূমি উন্নয়ন কর বা খাজনা পরিশোধের রসিদ (দাখিলা)।",
                          "৬. বায়া দলিলের কপি (যাদের কাছ থেকে কিনেছেন তাদের মূল দলিলের কপি)।"
                        ].map((doc, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-700 flex gap-2">
                            <span className="text-emerald-600">✓</span>
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {namjariTab === 'faq' && (
                      <div className="space-y-3">
                        {[
                          { q: "ই-নামজারি হতে সর্বোচ্চ কতদিন সময় লাগে?", a: "সাধারণ আবেদনের ক্ষেত্রে সর্বোচ্চ ২৮ কার্যদিবস এবং প্রবাসী নাগরিকদের ক্ষেত্রে বিশেষ ব্যবস্থাপনায় ৯ কার্যদিবসের মধ্যে নামজারি সম্পন্ন করা হয়ে থাকে।" },
                          { q: "অনলাইনে ফি কীভাবে পরিশোধ করবো?", a: "আবেদন সাবমিট করার পর একপে (Ekpay) গেটওয়ের মাধ্যমে যেকোনো মোবাইল ব্যাংকিং যেমন বিকাশ, নগদ, রকেট বা ডেবিট কার্ডের মাধ্যমে সরাসরি ফি পরিশোধ করা যায়।" },
                          { q: "আবেদন বাতিল হলে করণীয় কী?", a: "আবেদন বাতিল হলে পুঠিয়া উপজেলা ভূমি অফিসে সহকারী কমিশনার (ভূমি) বরাবর রিভিশন মামলা দায়ের করা যেতে পারে অথবা কারণ সংশোধন করে পুনরায় আবেদন করা যাবে।" }
                        ].map((item, i) => (
                          <div key={i} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                            <p className="text-xs font-black text-slate-800">Q. {item.q}</p>
                            <p className="text-xs text-slate-600 font-bold mt-1.5 leading-relaxed">A. {item.a}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CARD 4 CONTENT: LAND DEVELOPMENT TAX */}
              {selectedCard === "tax" && (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {[
                      { id: 'pay', label: '💰 অনলাইনে কর প্রদান' },
                      { id: 'calc', label: '🧮 কর হিসাব করুন' },
                      { id: 'receipt', label: '✅ রসিদ যাচাই' },
                      { id: 'dues', label: '🔍 বকেয়া কর দেখুন' }
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setTaxTab(tab.id as any)}
                        className={`px-5 py-3.5 text-xs font-black border-b-2 transition cursor-pointer ${taxTab === tab.id ? 'border-[#5C3A21] text-[#5C3A21] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    {taxTab === 'pay' && (
                      <div className="space-y-4">
                        {taxPaidStatus !== "success" ? (
                          <form onSubmit={handleTaxPayment} className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <p className="text-xs text-blue-600 font-bold">নিবন্ধনকৃত মোবাইল ও হোল্ডিং নম্বর দিয়ে বকেয়া খাজনা অনলাইনে সরাসরি পেমেন্ট করতে নিচের ডেমো ফরমটি ব্যবহার করুন।</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-black text-slate-600 mb-1.5">নিবন্ধনকৃত মোবাইল নম্বর *</label>
                                <input 
                                  type="tel" 
                                  required
                                  placeholder="যেমন: ০১৭১২৩৪৫৬৭৮"
                                  value={taxPayForm.mobile || ""}
                                  onChange={(e) => setTaxPayForm({...taxPayForm, mobile: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-black text-slate-600 mb-1.5">জাতীয় পরিচয়পত্র (NID) *</label>
                                <input 
                                  type="text" 
                                  required
                                  placeholder="যেমন: ৩২৫৯৪১২০৫৬"
                                  value={taxPayForm.nid || ""}
                                  onChange={(e) => setTaxPayForm({...taxPayForm, nid: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-black text-slate-600 mb-1.5">হোল্ডিং নম্বর *</label>
                                <input 
                                  type="text" 
                                  required
                                  placeholder="যেমন: HOLD-4859"
                                  value={taxPayForm.holding || ""}
                                  onChange={(e) => setTaxPayForm({...taxPayForm, holding: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-black text-slate-600 mb-1.5">জন্ম তারিখ (ঐচ্ছিক)</label>
                                <input 
                                  type="date" 
                                  value={taxPayForm.dob || ""}
                                  onChange={(e) => setTaxPayForm({...taxPayForm, dob: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                />
                              </div>
                            </div>
                            <button type="submit" className="w-full bg-[#5C3A21] hover:bg-[#4E311B] text-white py-3 rounded-xl text-xs font-black transition cursor-pointer">
                              {taxPaidStatus === "processing" ? "প্রসেসিং হচ্ছে..." : "কর ও খাজনা পরিশোধ করুন"}
                            </button>
                          </form>
                        ) : (
                          <div className="text-center py-6 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                              <CheckCircle className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800">পেমেন্ট সফলভাবে পরিশোধিত হয়েছে!</h3>
                            <p className="text-xs text-slate-500 font-bold max-w-xs mx-auto">
                              আপনার ভূমি উন্নয়ন কর সম্পূর্ণ অনলাইনে পরিশোধিত হয়েছে এবং ই-দাখিলা রসিদটি জেনারেট করা হয়েছে।
                            </p>
                            <button 
                              onClick={() => setTaxPaidStatus(null)}
                              className="bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-xl"
                            >
                              আরেকটি পেমেন্ট করুন
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {taxTab === 'calc' && (
                      <div className="space-y-4">
                        <form onSubmit={calculateTax} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-black text-slate-600 mb-1.5">জমির শ্রেণী বা ধরণ</label>
                            <select 
                              value={taxCalcForm.landClass || ""}
                              onChange={(e) => setTaxCalcForm({...taxCalcForm, landClass: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                            >
                              <option value="agricultural">কৃষি জমি (আবাদী/অনাবাদী)</option>
                              <option value="residential">আবাসিক জমি (গৃহ নির্মাণ)</option>
                              <option value="commercial">বাণিজ্যিক জমি (দোকান/মিল/হোটেল)</option>
                              <option value="industrial">শিল্প কারখানা বা ভারী শিল্প</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-black text-slate-600 mb-1.5">জমির পরিমাণ (শতক হিসেবে)</label>
                            <input 
                              type="number" 
                              required
                              placeholder="যেমন: ১৫"
                              value={taxCalcForm.areaSize || ""}
                              onChange={(e) => setTaxCalcForm({...taxCalcForm, areaSize: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <button type="submit" className="sm:col-span-2 bg-[#5C3A21] hover:bg-[#4E311B] text-white py-2.5 rounded-xl text-xs font-black transition cursor-pointer">
                            বার্ষিক খাজনা হিসাব করুন
                          </button>
                        </form>

                        {taxCalcResult !== null && (
                          <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-2xl flex justify-between items-center mt-4">
                            <span className="text-xs font-bold text-slate-700">আনুমানিক বার্ষিক করের পরিমাণ:</span>
                            <span className="text-base font-black text-emerald-800">{taxCalcResult} টাকা</span>
                          </div>
                        )}
                      </div>
                    )}

                    {taxTab === 'receipt' && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500 font-bold">ই-দাখিলা বা পেমেন্ট চালানের রসিদ যাচাই করতে নিচে ট্রানজেকশন বা চালান রেফারেন্স নম্বর দিন।</p>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                          <input type="text" placeholder="যেমন: TXN-485209384" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none" />
                          <button 
                            type="button" 
                            onClick={() => showToast("রসিদটি সরকারি পোর্টালে নিবন্ধিত ও বৈধ পাওয়া গিয়েছে।")}
                            className="w-full bg-emerald-600 text-white py-2 rounded-xl text-xs font-black hover:bg-emerald-700 cursor-pointer"
                          >
                            দাখিলা যাচাই করুন
                          </button>
                        </div>
                      </div>
                    )}

                    {taxTab === 'dues' && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500 font-bold">আপনার হোল্ডিং-এর বর্তমান বকেয়া করের পরিমাণ দেখতে হোল্ডিং নম্বরটি নিচে সার্চ করুন।</p>
                        <div className="flex gap-2">
                          <input type="text" placeholder="যেমন: HOLD-4859" className="flex-1 bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none" />
                          <button 
                            type="button" 
                            onClick={() => showToast("উক্ত হোল্ডিং-এ বকেয়া করের পরিমাণ: ৪৫ টাকা")}
                            className="bg-[#5C3A21] text-white px-4 rounded-xl text-xs font-black hover:bg-[#4E311B] cursor-pointer"
                          >
                            বকেয়া খুঁজুন
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CARD 5 CONTENT: DAG NUMBER SEARCH */}
              {selectedCard === "dag" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      💡 <span className="text-red-600">ইন্টারেক্টিভ গাইড:</span> পুঠিয়া উপজেলায় যেকোনো দাগ (Plot) নম্বর দিয়ে অনুসন্ধান করুন। ডেমো অনুসন্ধানের জন্য দাগ নম্বর <span className="font-extrabold text-slate-900">১২০৪</span> বা <span className="font-extrabold text-slate-900">৮৮৫</span> সার্চ করে ফলাফল দেখুন।
                    </p>
                  </div>

                  <form onSubmit={handleDagSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-600 mb-1.5">মৌজার নাম</label>
                      <select 
                        value={dagSearchForm.mouza || ""}
                        onChange={(e) => setDagSearchForm({...dagSearchForm, mouza: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                      >
                        <option value="">নির্বাচন করুন</option>
                        <option value="পুঠিয়া">পুঠিয়া (JL-87)</option>
                        <option value="বিড়ালদহ">বিড়ালদহ (JL-91)</option>
                        <option value="জিউপাড়া">জিউপাড়া (JL-102)</option>
                        <option value="বানেশ্বর">বানেশ্বর (JL-135)</option>
                        <option value="শিলমাড়ীয়া">শিলমাড়ীয়া (JL-145)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-600 mb-1.5">দাগ নম্বর লিখুন *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="যেমন: ১২০৪"
                        value={dagSearchForm.dagNo || ""}
                        onChange={(e) => setDagSearchForm({...dagSearchForm, dagNo: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="sm:col-span-2 bg-[#5C3A21] hover:bg-[#4E311B] text-white py-2.5 rounded-xl text-xs font-black transition cursor-pointer">
                      দাগ নম্বর অনুসন্ধান
                    </button>
                  </form>

                  {dagSearched && (
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-black text-slate-800 mb-3">🔍 অনুসন্ধান ফলাফল ({dagSearchResults.length})</h4>
                      {dagSearchResults.length > 0 ? (
                        <div className="space-y-3">
                          {dagSearchResults.map((rec, i) => (
                            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                              <p className="text-xs text-slate-700 font-bold"><span className="text-slate-400">মালিকের নাম:</span> {rec.ownerName}</p>
                              <p className="text-xs text-slate-700 font-bold"><span className="text-slate-400">খতিয়ান নম্বর:</span> {rec.khatian}</p>
                              <p className="text-xs text-slate-700 font-bold"><span className="text-slate-400">মৌজা:</span> {rec.mouza} (দাগ: {rec.dag})</p>
                              <p className="text-xs text-slate-700 font-bold"><span className="text-slate-400">জমির শ্রেণী:</span> {rec.class}</p>
                              <p className="text-xs text-slate-700 font-bold"><span className="text-slate-400">জমির মোট অংশ পরিমাণ:</span> {rec.area} শতক</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-4 text-xs font-bold text-slate-400">কোনো রেকর্ড খুঁজে পাওয়া যায়নি।</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* CARD 6 CONTENT: PORCHA/RECORD */}
              {selectedCard === "record" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-[#5C3A21]">মূল সার্টিফাইড পর্চা উত্তোলনের গাইডলাইন</h3>
                  <div className="space-y-3 text-xs text-slate-600 font-medium leading-relaxed">
                    <p>অনলাইন কপি বা ই-পর্চার পাশাপাশি দলিলের রেজিস্ট্রি বা আদালতে মামলা দায়ের করার সুবিধার্থে মূল সার্টিফাইড বা মোহরীকৃত পর্চার প্রয়োজন হয়।</p>
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-[#78350F] space-y-1 font-bold">
                      <p>⏱️ ডেলিভারি সময়সীমা:</p>
                      <p>• সাধারণ ডেলিভারি: ৭ থেকে ১০ কার্যদিবস (সরকারি ডাকযোগে)</p>
                      <p>• জরুরি ডেলিভারি: ৩ থেকে ৫ কার্যদিবস (জেলা রেকর্ড রুম বা কাউন্টার থেকে সরাসরি সংগ্রহ)</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                      <p className="font-black text-slate-800">পর্চা বা রেকর্ড ফি হিসাব:</p>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-500 font-bold">
                        <span>কোর্ট ফি (সার্টিফাইড কপি)</span>
                        <span className="text-slate-850 font-black">৫০ টাকা</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-500 font-bold">
                        <span>রেকর্ডরুম অনুসন্ধান ফি</span>
                        <span className="text-slate-850 font-black">৩০ টাকা</span>
                      </div>
                      <div className="flex justify-between text-slate-800 font-black">
                        <span>মোট আনুমানিক খরচ</span>
                        <span>১০০ টাকা</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 7 CONTENT: LAND OFFICE LOCATION */}
              {selectedCard === "office" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <p className="text-xs text-slate-500 font-bold">পুঠিয়া উপজেলার সকল ডিজিটাল ইউনিয়ন ভূমি অফিসের ঠিকানা ও সহকারী ভূমি কর্মকর্তাদের যোগাযোগ বিবরণ:</p>
                  <div className="space-y-3">
                    {[
                      { name: "পুঠিয়া উপজেলা সহকারী কমিশনার (ভূমি) কার্যালয়", address: "উপজেলা পরিষদ চত্বর সংলগ্ন, পুঠিয়া", phone: "০৭২১৯৫৬০০০" },
                      { name: "পুঠিয়া পৌর ভূমি অফিস", address: "পুঠিয়া রাজবাড়ি রোড, পুঠিয়া সদর", phone: "০১৭১২৪৮৫৯২০" },
                      { name: "জিউপাড়া ইউনিয়ন ভূমি অফিস", address: "জিউপাড়া ইউনিয়ন পরিষদ চত্বর", phone: "০১৭১১৫৮৯২৮২" },
                      { name: "ভালুকগাছী ইউনিয়ন ভূমি অফিস", address: "ধোকড়াকুল বাজার, পুঠিয়া", phone: "০১৭২২৪৮৯১০২" },
                      { name: "বেলপুকুরিয়া ইউনিয়ন ভূমি অফিস", address: "বেলপুকুর বাজার, ঢাকা-রাজশাহী মহাসড়ক", phone: "০১৭১২৮৫৯৩৯৪" },
                      { name: "বানেশ্বর ইউনিয়ন ভূমি অফিস", address: "বানেশ্বর বাজার (ফায়ার সার্ভিসের উত্তর পাশে)", phone: "০১৭১৫৪৮৯২৮৩" },
                      { name: "শিলমাড়ীয়া ইউনিয়ন ভূমি অফিস", address: "সাধনপুর বাজার, পুঠিয়া", phone: "০১৭১৮৪৮২৯৪০" }
                    ].map((office, i) => (
                      <div key={i} className="border border-slate-100 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-800">{office.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">📍 {office.address}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <a 
                            href={`tel:${office.phone}`} 
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1"
                          >
                            <Phone size={12} /> কল
                          </a>
                          <a 
                            href="https://maps.google.com/?q=Puthia+AC+Land+Office" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-slate-900 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1"
                          >
                            <MapPin size={12} /> ম্যাপ
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CARD 8 CONTENT: AC LAND DETAILS */}
              {selectedCard === "ac" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                      <Landmark className="w-8 h-8 text-amber-600" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800">সহকারী কমিশনার (ভূমি) এর কার্যালয়, পুঠিয়া</h3>
                    <p className="text-xs text-slate-400 font-bold">রাজশাহী জেলা প্রশাসন ও ভূমি মন্ত্রণালয়</p>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">অফিসিয়াল হটলাইন</span>
                      <a href="tel:16122" className="text-slate-800 font-black bg-white px-3 py-1 rounded-lg border border-slate-200">১৬১২২</a>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">উপজেলা ভূমি অফিস ইমেইল</span>
                      <span className="text-slate-800 font-black">aclandputhia@gmail.com</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">শুনানির দিন</span>
                      <span className="text-slate-800 font-black">প্রতি রবিবার ও বুধবার (সকাল ১০ - দুপুর ১টা)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 9 CONTENT: LAND LAW */}
              {selectedCard === "law" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-[#5C3A21]">গুরুত্বপূর্ণ ভূমি আইন ও উত্তরাধিকার গাইড</h3>
                  <div className="space-y-3">
                    {[
                      { title: "ভূমি সংস্কার আইন ২০২৩", desc: "নতুন পাস হওয়া এই আইনের অধীনে কোনো একক ব্যক্তি ৬০ বিঘা বা তার বেশি কৃষিজমি রাখতে পারবেন না। জমি অবৈধভাবে দখল বা দলিল জালকারীকে কঠোর কারাদণ্ড প্রদানের বিধান রয়েছে।" },
                      { title: "হেবা দলিল রেজিস্ট্রেশন আইন", desc: "নিকটবর্তী রক্ত সম্পর্কিত আত্মীয়দের যেমন পিতা-মাতা, স্বামী-স্ত্রী, সন্তান বা ভাই-বোনদের মধ্যে জমি হস্তান্তর বা হেবা দলিলের সরকারি রেজিস্ট্রেশন ফি মাত্র ১০০ টাকা নির্ধারিত।" },
                      { title: "উত্তরাধিকার বন্টন আইন (ফারায়েজ)", desc: "পারিবারিক সম্পত্তির শান্তিপূর্ণ এবং আইনি সুষ্ঠু বন্টনের জন্য মৃত ব্যক্তির রেখে যাওয়া স্থাবর সম্পত্তি ফারায়েজ পরিমাপ অনুযায়ী বন্টন নামা দলিলের মাধ্যমে রেজিস্ট্রি সম্পন্ন করতে হয়।" }
                    ].map((law, i) => (
                      <div key={i} className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                        <h4 className="text-xs font-black text-slate-800 mb-1 flex items-center gap-2">
                          <Scale size={14} className="text-rose-600" /> {law.title}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">{law.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CARD 10 CONTENT: FEE CALCULATOR */}
              {selectedCard === "calculator" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <form onSubmit={calculateFees} className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-600 font-bold">জমির আনুমানিক বাজার মূল্য দিয়ে সরকারি রেজিস্ট্রি ও আনুষঙ্গিক দলিলের রেজিস্ট্রেশন খরচ কত আসবে দেখে নিন।</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-600 mb-1.5">জমির বাজার মূল্য (টাকায়) *</label>
                        <input 
                          type="number" 
                          required
                          placeholder="যেমন: ৫০০০০০"
                          value={feeCalcForm.value || ""}
                          onChange={(e) => setFeeCalcForm({...feeCalcForm, value: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-600 mb-1.5">হস্তান্তরের ধরণ</label>
                        <select 
                          value={feeCalcForm.relation || ""}
                          onChange={(e) => setFeeCalcForm({...feeCalcForm, relation: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                        >
                          <option value="others">সাধারণ বিক্রয় দলিল</option>
                          <option value="family">হেবা বা পারিবারিক দান</option>
                          <option value="inheritance">উত্তরাধিকার বন্টন নামা</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-[#5C3A21] hover:bg-[#4E311B] text-white py-2.5 rounded-xl text-xs font-black transition cursor-pointer">
                      রেজিস্ট্রি খরচ হিসাব করুন
                    </button>
                  </form>

                  {feeCalcResult && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                      <h4 className="text-xs font-black text-slate-800 border-b border-slate-200 pb-1.5">📊 ফি ব্রেকডাউন:</h4>
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>স্ট্যাম্প ডিউটি ফি (১.৫%):</span>
                        <span className="text-slate-900">{feeCalcResult.stamp} টাকা</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>রেজিস্ট্রেশন ফি (১%):</span>
                        <span className="text-slate-900">{feeCalcResult.reg} টাকা</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>স্থানীয় সরকার কর (২%):</span>
                        <span className="text-slate-900">{feeCalcResult.localTax} টাকা</span>
                      </div>
                      {feeCalcResult.sourceTax > 0 && (
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>উৎস কর (৩%):</span>
                          <span className="text-slate-900">{feeCalcResult.sourceTax} টাকা</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs font-black text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                        <span>সর্বমোট আনুমানিক রেজিস্ট্রেশন ফি:</span>
                        <span>{feeCalcResult.total} টাকা</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CARD 11 CONTENT: SERIAL / APPOINTMENT */}
              {selectedCard === "appointment" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  {!appointmentStatus ? (
                    <form onSubmit={handleBookAppointment} className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-xs text-orange-600 font-bold">পুঠিয়া উপজেলা বা ইউনিয়ন সহকারী কমিশনারের সাথে সাক্ষাৎ, শুনানি বা সাধারণ ভূমি পরামর্শের জন্য নিচের ডেমো স্লটটি বুক করুন।</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-slate-600 mb-1.5">আপনার নাম *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="যেমন: মোহাঃ আসলাম হোসাইন"
                            value={appointmentForm.name || ""}
                            onChange={(e) => setAppointmentForm({...appointmentForm, name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-600 mb-1.5">মোবাইল নম্বর *</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="যেমন: ০১৭১২৩৪৫৬৭৮"
                            value={appointmentForm.phone || ""}
                            onChange={(e) => setAppointmentForm({...appointmentForm, phone: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-600 mb-1.5">সাক্ষাৎকারের তারিখ *</label>
                          <input 
                            type="date" 
                            required
                            value={appointmentForm.date || ""}
                            onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-600 mb-1.5">পছন্দসই সময় স্লট *</label>
                          <select 
                            value={appointmentForm.time || ""}
                            onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                          >
                            <option value="">নির্বাচন করুন</option>
                            <option value="10:00 AM">১০:০০ AM - ১০:৩০ AM</option>
                            <option value="11:00 AM">১১:০০ AM - ১১:৩০ AM</option>
                            <option value="12:00 PM">১২:০০ PM - ১২:৩০ PM</option>
                            <option value="02:30 PM">০২:৩০ PM - ০৩:০০ PM</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-black text-slate-600 mb-1.5">সাক্ষাতের সংক্ষিপ্ত বিষয়/উদ্দেশ্য</label>
                          <textarea 
                            rows={3}
                            placeholder="যেমন: নামজারি শুনানির সময় সংক্রান্ত অথবা জমি পরিমাপ জটিলতা..."
                            value={appointmentForm.purpose || ""}
                            onChange={(e) => setAppointmentForm({...appointmentForm, purpose: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                          />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-[#5C3A21] hover:bg-[#4E311B] text-white py-2.5 rounded-xl text-xs font-black transition cursor-pointer">
                        অ্যাইস্টারমেন্ট সম্পন্ন করুন
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                      </div>
                      <h3 className="text-sm font-black text-slate-800">সিরিয়াল বুকিং সম্পন্ন হয়েছে!</h3>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-w-sm mx-auto space-y-1 text-left text-xs font-bold text-slate-600">
                        <p><span className="text-slate-400">নাম:</span> {appointmentForm.name}</p>
                        <p><span className="text-slate-400">তারিখ:</span> {appointmentForm.date}</p>
                        <p><span className="text-slate-400">সময় স্লট:</span> {appointmentForm.time}</p>
                        <p className="text-[#EA580C] mt-2 block text-center font-black">নির্ধারিত তারিখে ১৫ মিনিট পূর্বে অফিসে উপস্থিত থাকুন।</p>
                      </div>
                      <button 
                        onClick={() => {
                          setAppointmentStatus(null);
                          setAppointmentForm({ name: '', phone: '', purpose: '', office: 'upazila', date: '', time: '' });
                        }}
                        className="text-xs font-black text-slate-500 hover:underline"
                      >
                        অন্য অ্যাইস্টারমেন্ট করুন
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* CARD 12 CONTENT: FAQ */}
              {selectedCard === "faq" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-[#5C3A21]">পুঠিয়া উপজেলা ডিজিটাল ভূমি সেবা সাধারণ জিজ্ঞাসা</h3>
                  <div className="space-y-3">
                    {[
                      { q: "দাগ ও খতিয়ানের মধ্যে পার্থক্য কী?", a: "দাগ নম্বর হলো প্রতিটি নির্দিষ্ট জমি বা প্লটের সীমানা নির্দেশক সরকারি অনন্য পরিচিতি নম্বর। আর খতিয়ান হলো উক্ত দাগের বা একাধিক দাগের মালিকের আইনি রেকর্ড সম্বলিত দলিলপত্র।" },
                      { q: "ভুল খতিয়ান সংশোধনের উপায় কী?", a: "খতিয়ানে নামের বানান বা জমির অংশে ভুল থাকলে উপজেলা ভূমি অফিসে সহকারী কমিশনার (ভূমি) বরাবর প্রয়োজনীয় কাগজপত্র সহ ৩০ ধারায় রেকর্ড সংশোধনের মিস মামলা দায়ের করা যায়।" },
                      { q: "দাখিলা বা খাজনার রসিদ হারিয়ে গেলে কী করব?", a: "অনলাইন সিস্টেমে হোল্ডিং নম্বর দিয়ে লগইন করলে পূর্বের পরিশোধিত সকল দাখিলা ও চালানের অনলাইন কপি সহজেই পুনরায় প্রিন্ট করে নেওয়া যায়।" }
                    ].map((item, i) => (
                      <div key={i} className="border border-slate-100 p-4 bg-slate-50/50 rounded-2xl">
                        <p className="text-xs font-black text-slate-800">Q. {item.q}</p>
                        <p className="text-xs text-slate-600 font-bold leading-relaxed mt-1.5">A. {item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right side: Helper tools and action buttons (Helpline, Website, Guides, Map, Favorites) */}
            <div className="space-y-6">
              
              {/* Universal Actions Sidebar Card */}
              <div className="bg-white rounded-[32px] p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.015)] space-y-5">
                <h3 className="text-xs font-black text-[#5C3A21] uppercase tracking-wider border-b border-slate-100 pb-2.5">🛠️ নাগরিক সেবা ও একশন সেন্টার</h3>
                
                <div className="space-y-3">
                  
                  {/* SEARCH WITHIN */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="সেবার ভেতরে খুঁজুন..." 
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-9 pr-3 py-2 text-[11px] font-bold focus:outline-none"
                    />
                  </div>

                  {/* CALL BUTTON */}
                  <a 
                    href="tel:16122"
                    className="flex items-center gap-3 w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl p-3 border border-emerald-100 transition text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <PhoneCall size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black leading-tight">📞 কল সেন্টার (হেল্পলাইন)</p>
                      <p className="text-[9px] font-bold text-emerald-600/80 mt-0.5">টোল-ফ্রি: ১৬১২২ (২৪ ঘণ্টা)</p>
                    </div>
                  </a>

                  {/* WEBSITE BUTTON */}
                  <a 
                    href="https://land.gov.bd" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl p-3 border border-amber-100 transition text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#5C3A21] text-white flex items-center justify-center shrink-0">
                      <Globe size={14} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black leading-tight">🌐 অফিসিয়াল ওয়েবসাইট</p>
                      <p className="text-[9px] font-bold text-amber-600/80 mt-0.5">land.gov.bd (ভূমি মন্ত্রনালয়)</p>
                    </div>
                  </a>

                  {/* GOOGLE MAPS BUTTON */}
                  <a 
                    href="https://maps.google.com/?q=Puthia+AC+Land+Office" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl p-3 border border-blue-100 transition text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <MapPin size={14} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black leading-tight">📍 Google Map লোকেশন</p>
                      <p className="text-[9px] font-bold text-blue-600/80 mt-0.5">সহকারী কমিশনার (ভূমি) অফিস, পুঠিয়া</p>
                    </div>
                  </a>

                  {/* DOWNLOAD FORMS */}
                  <a 
                    href="https://land.gov.bd/forms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl p-3 border border-teal-100 transition text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Download size={14} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black leading-tight">📥 প্রয়োজনীয় ফরম ডাউনলোড</p>
                      <p className="text-[9px] font-bold text-teal-600/80 mt-0.5">নামজারি, খাজনা ও বিবিধ আবেদন ফরম</p>
                    </div>
                  </a>

                </div>

                <div className="border-t border-slate-100 pt-3.5 flex gap-3">
                  {/* FAVORITES */}
                  <button 
                    onClick={() => toggleFavorite(selectedCard)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-black transition cursor-pointer ${favorites.includes(selectedCard) ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}`}
                  >
                    <Star size={12} className={favorites.includes(selectedCard) ? "fill-white" : ""} /> {favorites.includes(selectedCard) ? "সংরক্ষিত" : "প্রিয়তে সংরক্ষণ"}
                  </button>

                  {/* SHARE */}
                  <button 
                    onClick={() => shareService(selectedCard, cards.find(c => c.id === selectedCard)?.title || "")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-[10px] font-black transition cursor-pointer"
                  >
                    <Share2 size={12} /> শেয়ার করুন
                  </button>
                </div>
              </div>

              {/* Step-by-Step Step guide info block */}
              <div className="bg-slate-50 rounded-[28px] p-5 border border-slate-100 space-y-3.5">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <BookOpen size={14} className="text-[#5C3A21]" /> 📖 ধাপে ধাপে নির্দেশিকা
                </h4>
                <div className="space-y-2 text-[11px] font-bold text-slate-600 leading-relaxed">
                  <p>১. আপনার প্রয়োজনীয় সেবাটি নির্বাচন করুন।</p>
                  <p>২. নির্দেশিকার ধাপগুলো যত্নসহকারে পাঠ করুন।</p>
                  <p>৩. প্রয়োজনীয় ফরম ডাউনলোড করতে "প্রয়োজনীয় ফরম" বাটনে ক্লিক করুন।</p>
                  <p>৪. সমস্যা বা বিরোধ নিষ্পত্তিতে সরাসরি কল করুন হেল্পলাইনে।</p>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Cards Grid List view (Only visible when no specific card is selected) */
          <div className="space-y-6 animate-fade-in">
            
            {/* Introductory Instruction Banner */}
            <div className="bg-gradient-to-br from-[#E6F4EA] to-[#F1FBF4] border border-emerald-100 rounded-3xl p-5 flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 text-white">
                <CheckCircle size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-900">পুঠিয়ার অনলাইন পোর্টাল</h3>
                <p className="text-xs font-bold text-slate-500 mt-1 leading-snug">
                  আপনার কাঙ্ক্ষিত ভূমি সেবাটি বাছাই করুন। আমরা পুঠিয়া উপজেলা প্রশাসনের সহযোগিতায় প্রতিটি সেবার ধাপে ধাপে গাইডলাইন, কন্টাক্ট এবং সরাসরি অনলাইন পোর্টালে আবেদনের সংযোগ নিশ্চিত করেছি।
                </p>
              </div>
            </div>

            {/* Grid of 12 beautiful cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredCards.map((card, i) => {
                const isFav = favorites.includes(card.id);
                return (
                  <div 
                    key={card.id}
                    onClick={() => {
                      setSelectedCard(card.id);
                      navigate(`/land/${card.id}`);
                    }}
                    className={`bg-white rounded-[24px] p-5 border border-slate-150/80 shadow-[0_2px_8px_rgba(0,0,0,0.015)] cursor-pointer flex flex-col justify-between hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group overflow-hidden`}
                  >
                    {/* Top background accent on group hover */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-transparent group-hover:bg-[#5C3A21]/15 transition-all"></div>
                    
                    <div className="space-y-3 relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                          {card.icon}
                        </div>
                        {isFav && (
                          <span className="bg-amber-100 text-[#B45309] text-[9px] font-black px-2.5 py-0.5 rounded-full border border-amber-200">প্রিয়</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 group-hover:text-[#5C3A21] transition">{card.title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 leading-relaxed line-clamp-2">{card.subtitle}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-[#5C3A21] relative z-10">
                      <span>বিস্তারিত দেখুন</span>
                      <ArrowLeft size={12} className="rotate-180 group-hover:translate-x-1.5 transition duration-300" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Zero state when search results empty */}
            {filteredCards.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-black text-slate-800">কোনো ম্যাচিং সেবা পাওয়া যায়নি!</h4>
                <p className="text-xs text-slate-400 font-bold max-w-xs mx-auto mt-1 leading-relaxed">অনুগ্রহ করে ভিন্ন কোনো শব্দ যেমন "খতিয়ান", "ম্যাপ", "কর" বা "নামজারি" দিয়ে পুনরায় সার্চ করুন।</p>
              </div>
            )}
            
          </div>
        )}

      </div>
    </div>
  );
}

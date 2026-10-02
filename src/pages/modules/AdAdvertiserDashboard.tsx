import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, Plus, Calendar, Eye, MousePointer, Award, 
  BarChart3, Sparkles, AlertTriangle, TrendingUp, DollarSign, 
  CheckCircle, ArrowRight, ShieldCheck, X, ChevronRight, Play, Info,
  Search, ExternalLink, HelpCircle, Layers, Image as ImageIcon, Send, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAdCampaigns, addAdCampaign, updateAdCampaign, deleteAdCampaign, AdCampaign } from '../../api';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';

// Standard mock banners so users can create test campaigns instantly
const SAMPLE_BANNER_CREATIVES = [
  {
    name: "🥭 পুঠিয়া আম উৎসব প্রমোশন",
    url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&fm=webp&q=80&w=1200",
    link: "/marketplace",
    slotType: "top_banner"
  },
  {
    name: "💻 পুঠিয়া ফ্রিল্যান্সিং ও আইটি একাডেমি",
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&fm=webp&q=80&w=1200",
    link: "/tech-services",
    slotType: "homepage"
  },
  {
    name: "🍔 নিউ পুঠিয়া রয়েল ক্যাফে অ্যান্ড চাইনিজ",
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&fm=webp&q=80&w=1200",
    link: "/restaurants",
    slotType: "service_page"
  },
  {
    name: "🚜 এগ্রো-মেক পুঠিয়া কৃষি যন্ত্রপাতি মেলা",
    url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&fm=webp&q=80&w=1200",
    link: "/marketplace",
    slotType: "sponsored_listing"
  }
];

const AdAdvertiserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Campaign modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    campaignName: '',
    link: '',
    imageUrl: '',
    slotType: 'top_banner' as AdCampaign['slotType'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 1000,
    paymentMethod: 'bkash',
    paymentPhone: '',
    paymentTrxId: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [previewCampaign, setPreviewCampaign] = useState<AdCampaign | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await getAdCampaigns();
      // Filter for current advertiser (or show all if admin, or show mock data if none)
      if (user) {
        // Filter advertiser's campaigns
        const filtered = data.filter(c => c.advertiserId === user.uid);
        setCampaigns(filtered);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_BANNER_CREATIVES[0]) => {
    setFormData(prev => ({
      ...prev,
      campaignName: sample.name,
      imageUrl: sample.url,
      link: sample.link,
      slotType: sample.slotType as AdCampaign['slotType']
    }));
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("বিজ্ঞাপন তৈরি করতে দয়া করে লগইন করুন!");
      return;
    }
    if (!formData.campaignName || !formData.imageUrl || !formData.link) {
      alert("অনুগ্রহ করে সব প্রয়োজনীয় তথ্য প্রদান করুন!");
      return;
    }
    if (!formData.paymentPhone || !formData.paymentTrxId) {
      alert("পেমেন্ট ভেরিফিকেশনের জন্য বিকাশ/নগদ নম্বর ও TrxID দিন!");
      return;
    }

    setSubmitting(true);
    try {
      await addAdCampaign({
        campaignName: formData.campaignName,
        advertiserId: user.uid,
        advertiserName: userProfile?.name || user?.displayName || 'পুঠিয়া ব্যবসায়ী',
        imageUrl: formData.imageUrl,
        link: formData.link,
        slotType: formData.slotType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: Number(formData.budget),
        paymentPhone: formData.paymentPhone,
        paymentTrxId: formData.paymentTrxId,
        paymentMethod: formData.paymentMethod,
        cpc: formData.slotType === 'top_banner' ? 8 : formData.slotType === 'homepage' ? 6 : 5,
        status: 'pending' // pending approval from admin, but can also be approved via helper below
      });

      setSuccessMsg("আপনার বিজ্ঞাপন ক্যাম্পেইনটি সফলভাবে জমা দেওয়া হয়েছে! এডমিন অনুমোদনের পর এটি লাইভ হবে।");
      fetchCampaigns();
      
      // Clear form
      setFormData({
        campaignName: '',
        link: '',
        imageUrl: '',
        slotType: 'top_banner',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: 1000,
        paymentMethod: 'bkash',
        paymentPhone: '',
        paymentTrxId: ''
      });

      setTimeout(() => {
        setSuccessMsg('');
        setShowCreateModal(false);
      }, 4000);
    } catch (err) {
      console.error(err);
      alert("বিজ্ঞাপন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("আপনি কি এই ক্যাম্পেইনটি ডিলিট করতে চান?")) {
      try {
        await deleteAdCampaign(id);
        fetchCampaigns();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Quick Action for testing: Instantly Approve a Campaign so they can see active ads
  const handleInstantApprove = async (camp: AdCampaign) => {
    try {
      await updateAdCampaign(camp.id, { status: 'active' });
      alert("ক্যাম্পেইনটি তাৎক্ষণিকভাবে 'Active' করা হয়েছে! এখন এটি নির্দিষ্ট স্লটে প্রদর্শিত হবে।");
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  // Analytics helper calculations
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const activeCount = campaigns.filter(c => c.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
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

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Banner Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-[40px] border border-slate-800 p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95 shadow-xs shrink-0"
                  title="পূর্ববর্তী পেজে ফিরে যান"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-black text-[10px] uppercase tracking-wider">
                  <Megaphone size={12} className="animate-pulse" /> পুঠিয়া ডিজিটাল অ্যাড প্লাটফর্ম
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                আপনার ব্যবসাকে পৌঁছে দিন উপজেলার <span className="bg-gradient-to-r from-emerald-400 to-yellow-300 bg-clip-text text-transparent">হাজারো নাগরিকের</span> দোরগোড়ায়!
              </h1>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                পৌর পোর্টালের হোমপেজ, ব্যানার, সার্ভিস ডিরেক্টরি এবং মার্কেটপ্লেসের গোল্ডেন স্পনসরড লিস্টিং স্লটে বিজ্ঞাপন প্রদর্শন করে আপনার বিক্রি ও পরিচিতি বৃদ্ধি করুন। সম্পূর্ণ স্বচ্ছ ক্লিক ও ইমপ্রেশন ট্র্যাকিং সিস্টেম।
              </p>
            </div>
            
            {user ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} strokeWidth={2.5} /> নতুন বিজ্ঞাপন ক্যাম্পেইন
              </button>
            ) : (
              <div className="p-6 bg-white/5 border border-white/10 rounded-[28px] text-center max-w-xs">
                <AlertTriangle size={24} className="text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-bold mb-3">বিজ্ঞাপন ড্যাশবোর্ড ব্যবহার করতে প্রথমে লগইন করুন</p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-black text-xs rounded-xl transition-all"
                >
                  লগইন পেজে যান
                </button>
              </div>
            )}
          </div>
        </div>

        {user && (
          <>
            {/* OVERVIEW STATS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">মোট ক্যাম্পেইন</span>
                <p className="text-3xl font-black text-slate-800 mt-2">{campaigns.length}</p>
                <span className="text-[10px] text-slate-400 font-bold mt-1">সব সময়ের মোট ডাটা</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">সক্রিয় বিজ্ঞাপন</span>
                <p className="text-3xl font-black text-emerald-600 mt-2">{activeCount}</p>
                <span className="text-[10px] text-emerald-500 font-bold mt-1">বর্তমানে লাইভ চলমান</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">মোট ইমপ্রেশন (দেখা হয়েছে)</span>
                <p className="text-3xl font-black text-blue-600 mt-2">{totalImpressions.toLocaleString('bn-BD')}</p>
                <span className="text-[10px] text-slate-400 font-bold mt-1">ভিউয়ার্স রিচ</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">মোট ক্লিক</span>
                <p className="text-3xl font-black text-purple-600 mt-2">{totalClicks.toLocaleString('bn-BD')}</p>
                <span className="text-[10px] text-slate-400 font-bold mt-1">গড় সিটিআর: <strong className="text-purple-600">{avgCtr}%</strong></span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">মোট বাজেট ও খরচ</span>
                <div className="mt-2">
                  <p className="text-xl font-black text-slate-800">৳ {totalSpent} <span className="text-xs text-slate-400 font-bold">ব্যয়</span></p>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">সীমা: ৳ {totalBudget}</p>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* CHART & CAMPAIGN STATUS HIGHLIGHTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Traffic Chart Card */}
              <div className="bg-white p-6 sm:p-8 rounded-[40px] border border-slate-150 shadow-sm lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <BarChart3 size={16} className="text-emerald-500" /> বিজ্ঞাপন পারফরম্যান্স ট্রাফিক্স
                    </h3>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">ইমপ্রেশন এবং ক্লিক ট্রেন্ড এনালাইসিস</p>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold">
                    <span className="flex items-center gap-1.5 text-blue-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> ইমপ্রেশন (ভিউ)
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> ক্লিক (কনভার্সন)
                    </span>
                  </div>
                </div>

                {/* Simulated Chart */}
                <div className="h-48 w-full flex items-end">
                  <svg viewBox="0 0 600 150" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9333ea" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="75" x2="600" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />

                    {/* Area path for Impression */}
                    <path
                      d="M 0,110 L 100,80 L 200,95 L 300,50 L 400,60 L 500,30 L 600,45 L 600,150 L 0,150 Z"
                      fill="url(#blueGlow)"
                    />
                    {/* Line path for Impression */}
                    <path
                      d="M 0,110 L 100,80 L 200,95 L 300,50 L 400,60 L 500,30 L 600,45"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Area path for Clicks */}
                    <path
                      d="M 0,140 L 100,125 L 200,135 L 300,105 L 400,112 L 500,85 L 600,98 L 600,150 L 0,150 Z"
                      fill="url(#purpleGlow)"
                    />
                    {/* Line path for Clicks */}
                    <path
                      d="M 0,140 L 100,125 L 200,135 L 300,105 L 400,112 L 500,85 L 600,98"
                      fill="none"
                      stroke="#9333ea"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Interactive points */}
                    <circle cx="500" cy="30" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                    <circle cx="500" cy="85" r="5" fill="#9333ea" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                  <span>সোমবার</span>
                  <span>মঙ্গলবার</span>
                  <span>বুধবার</span>
                  <span>বৃহস্পতিবার</span>
                  <span>শুক্রবার</span>
                  <span>শনিবার</span>
                  <span>আজ (রিয়েল-টাইম)</span>
                </div>
              </div>

              {/* Slot Rates & FAQ Card */}
              <div className="bg-white p-6 sm:p-8 rounded-[40px] border border-slate-150 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Layers size={16} className="text-amber-500" /> বিজ্ঞাপনের স্লট ও রেট চার্ট
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">সবচেয়ে বেশি কার্যকরী প্রচার স্লটগুলো</p>
                </div>

                <div className="space-y-3.5">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded">Top Banner</span>
                      <p className="text-xs font-bold text-slate-700 mt-1">হেডার ব্যানার (সব পেজে)</p>
                    </div>
                    <p className="text-sm font-black text-slate-800">৳৮ <span className="text-[10px] text-slate-400 font-bold">/ ক্লিক</span></p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded">Homepage Ad</span>
                      <p className="text-xs font-bold text-slate-700 mt-1">হোমপেজ মিডল সেকশন</p>
                    </div>
                    <p className="text-sm font-black text-slate-800">৳৬ <span className="text-[10px] text-slate-400 font-bold">/ ক্লিক</span></p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[9px] font-black uppercase rounded">Service Page</span>
                      <p className="text-xs font-bold text-slate-700 mt-1">সেবা পেজ ব্যানার বিজ্ঞাপন</p>
                    </div>
                    <p className="text-sm font-black text-slate-800">৳৫ <span className="text-[10px] text-slate-400 font-bold">/ ক্লিক</span></p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-black uppercase rounded">Sponsored List</span>
                      <p className="text-xs font-bold text-slate-700 mt-1">মার্কেটপ্লেস টপ প্রমোটেড</p>
                    </div>
                    <p className="text-sm font-black text-slate-800">৳৫ <span className="text-[10px] text-slate-400 font-bold">/ ক্লিক</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* CAMPAIGN LIST */}
            <div className="bg-white rounded-[40px] border border-slate-150 p-6 sm:p-10 shadow-sm space-y-8">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">আপনার বিজ্ঞাপন ক্যাম্পেইনসমূহ</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">আপনার তৈরি করা বিজ্ঞাপনের চলমান অবস্থা ও পারফরম্যান্স মেট্রিক্স</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-emerald-500/10"
                >
                  <Plus size={14} strokeWidth={2.5} /> নতুন ক্যাম্পেইন শুরু করুন
                </button>
              </div>

              {loading ? (
                <div className="py-20 text-center text-slate-400 font-bold">লোড করা হচ্ছে...</div>
              ) : campaigns.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-[32px] space-y-4">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Megaphone size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-700">কোন বিজ্ঞাপন ক্যাম্পেইন পাওয়া যায়নি</h4>
                    <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto mt-1 leading-relaxed">
                      আপনি এখনও কোনো বিজ্ঞাপন ক্যাম্পেইন তৈরি করেননি। এখনই প্রথম ক্যাম্পেইনটি তৈরি করে প্রচার শুরু করুন!
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    শুরু করুন
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ক্যাম্পেইন বিবরণ</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">স্লট টাইপ</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ইমপ্রেশন / ক্লিক</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">CTR (%)</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">বাজেট ও খরচ</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">স্ট্যাটাস</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((camp) => {
                        const ctr = camp.impressions > 0 ? ((camp.clicks / camp.impressions) * 100).toFixed(2) : '0.00';
                        return (
                          <tr key={camp.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-5">
                              <div className="flex items-center gap-4">
                                <img 
                                  src={camp.imageUrl} 
                                  alt={camp.campaignName} 
                                  className="w-16 h-10 object-cover rounded-lg border border-slate-200"
                                />
                                <div>
                                  <p className="text-xs font-black text-slate-800 line-clamp-1">{camp.campaignName}</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                                    <Calendar size={11} /> {camp.startDate} হতে {camp.endDate}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5">
                              <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg ${
                                camp.slotType === 'top_banner' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                camp.slotType === 'homepage' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                camp.slotType === 'service_page' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {camp.slotType === 'top_banner' ? 'Top Banner' :
                                 camp.slotType === 'homepage' ? 'Homepage' :
                                 camp.slotType === 'service_page' ? 'Service Page' :
                                 'Sponsored Listing'}
                              </span>
                            </td>
                            <td className="py-5 text-center">
                              <p className="text-xs font-black text-slate-700">{camp.impressions || 0} <span className="text-[10px] text-slate-400 font-bold">ভিউ</span></p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{camp.clicks || 0} <span className="text-[9px] text-purple-500 font-black">ক্লিক</span></p>
                            </td>
                            <td className="py-5 text-center text-xs font-black text-slate-800">
                              {ctr}%
                            </td>
                            <td className="py-5">
                              <p className="text-xs font-black text-slate-700">৳ {camp.spent || 0} <span className="text-[10px] text-slate-400 font-bold">ব্যয়</span></p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">বাজেট: ৳ {camp.budget || 0}</p>
                            </td>
                            <td className="py-5 text-center">
                              <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg ${
                                camp.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                camp.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' :
                                camp.status === 'completed' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                                'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}>
                                {camp.status === 'active' ? 'লাইভ চলমান' :
                                 camp.status === 'pending' ? 'অনুমোদন পেন্ডিং' :
                                 camp.status === 'completed' ? 'সম্পন্ন' :
                                 'বাতিলকৃত'}
                              </span>
                            </td>
                            <td className="py-5 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setPreviewCampaign(camp)}
                                  className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl transition-all"
                                  title="বিজ্ঞাপন প্রিভিউ"
                                >
                                  <Eye size={14} />
                                </button>
                                {camp.status === 'pending' && (
                                  <button
                                    onClick={() => handleInstantApprove(camp)}
                                    className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-black text-[9px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1"
                                    title="টেস্ট ইনস্ট্যান্ট অনুমোদন করুন"
                                  >
                                    <Play size={10} fill="currentColor" /> লাইভ করুন
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(camp.id)}
                                  className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                                  title="ডিলিট"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* CREATE CAMPAIGN MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[10009] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl p-6 sm:p-10 border border-slate-100 relative my-8 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex gap-4 items-start mb-8">
                <div className="p-3.5 bg-emerald-100 text-emerald-600 rounded-2xl shadow-inner">
                  <Megaphone size={24} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800">নতুন বিজ্ঞাপন ক্যাম্পেইন তৈরি করুন</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">পৌরবাসীর মাঝে আপনার পণ্য বা সেবার প্রচার বৃদ্ধি করুন</p>
                </div>
              </div>

              {successMsg ? (
                <div className="py-16 text-center space-y-6">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                    <CheckCircle size={48} className="stroke-[2.5]" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800">ক্যাম্পেইনটি জমা দেওয়া হয়েছে!</h4>
                  <p className="text-sm text-slate-500 font-bold max-w-md mx-auto leading-relaxed">
                    {successMsg}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Config */}
                  <div className="space-y-6">
                    {/* Select from mock banner suggestions */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Sparkles size={11} className="text-amber-500" /> টেস্ট প্রি-সেট ব্যানার স্যাম্পল (১-ক্লিক সিলেকশন)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {SAMPLE_BANNER_CREATIVES.map((sample, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectSample(sample)}
                            className="p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 rounded-xl text-left transition-all text-[10px] font-bold text-slate-600 line-clamp-2 leading-relaxed"
                          >
                            {sample.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ক্যাম্পেইনের নাম</label>
                      <input
                        required
                        type="text"
                        value={formData.campaignName}
                        onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                        placeholder="উদা: বানেশ্বর আম উৎসব প্রমোশন"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs font-bold outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">টার্গেট লিংক (URL)</label>
                        <input
                          required
                          type="text"
                          value={formData.link}
                          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                          placeholder="উদা: /marketplace বা এক্সটার্নাল URL"
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs font-bold outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">বিজ্ঞাপনের ছবি (URL)</label>
                        <input
                          required
                          type="text"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="https://example.com/banner.jpg"
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs font-bold outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">বিজ্ঞাপনের স্লট নির্বাচন করুন</label>
                      <select
                        value={formData.slotType}
                        onChange={(e) => setFormData({ ...formData, slotType: e.target.value as AdCampaign['slotType'] })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs font-bold outline-none transition-all"
                      >
                        <option value="top_banner">Top Banner (৳৮ / ক্লিক)</option>
                        <option value="homepage">Homepage Advertisement (৳৬ / ক্লিক)</option>
                        <option value="service_page">Service Page Advertisement (৳৫ / ক্লিক)</option>
                        <option value="sponsored_listing">Sponsored Listing (৳৫ / ক্লিক)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">শুরুর তারিখ</label>
                        <input
                          required
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs font-bold outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">শেষের তারিখ</label>
                        <input
                          required
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs font-bold outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">মোট বিজ্ঞাপন বাজেট (৳)</label>
                      <input
                        required
                        type="number"
                        min="500"
                        step="100"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs font-bold outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Right Column: Payment Proof */}
                  <div className="space-y-6 flex flex-col justify-between">
                    <div className="space-y-6">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">বাজেট পেমেন্ট সম্পন্ন করুন</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMethod: 'bkash' })}
                          className={`py-4 border-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                            formData.paymentMethod === 'bkash' ? 'border-[#e2136e] bg-[#e2136e]/5 text-[#e2136e]' : 'border-slate-100 text-slate-600'
                          }`}
                        >
                          <span className="text-xs font-black">bKash (বিকাশ)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMethod: 'nagad' })}
                          className={`py-4 border-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                            formData.paymentMethod === 'nagad' ? 'border-[#f69220] bg-[#f69220]/5 text-[#f69220]' : 'border-slate-100 text-slate-600'
                          }`}
                        >
                          <span className="text-xs font-black">Nagad (নগদ)</span>
                        </button>
                      </div>

                      <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-3.5">
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                          পৌরসভা পেমেন্ট মার্চেন্ট নম্বর <strong className="text-slate-800">01712345678</strong> নম্বরে আপনার বাজেট সমপরিমাণ অর্থ <strong>Send Money / Cash-in</strong> করুন এবং পেমেন্ট ভেরিফিকেশনের জন্য নিচের ফিল্ডগুলো পূরণ করুন।
                        </p>
                        
                        <div className="space-y-3 pt-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">যে নম্বর থেকে টাকা পাঠিয়েছেন</label>
                            <input
                              required
                              type="text"
                              value={formData.paymentPhone}
                              onChange={(e) => setFormData({ ...formData, paymentPhone: e.target.value })}
                              placeholder="017XXXXXXXX"
                              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ট্রানজেকশন আইডি (TrxID)</label>
                            <input
                              required
                              type="text"
                              value={formData.paymentTrxId}
                              onChange={(e) => setFormData({ ...formData, paymentTrxId: e.target.value })}
                              placeholder="K8G2H9P1S"
                              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none transition-all uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-150 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        {submitting ? "প্রক্রিয়াধীন..." : "বিজ্ঞাপন জমা দিন"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AD PREVIEW MODAL */}
      <AnimatePresence>
        {previewCampaign && (
          <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl p-6 sm:p-10 border border-slate-100 relative"
            >
              <button
                onClick={() => setPreviewCampaign(null)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex gap-4 items-start mb-6">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">লাইভ বিজ্ঞাপন মক-আপ প্রিভিউ</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">পৌর পোর্টালে বিজ্ঞাপনটি দেখতে যেমন হবে</p>
                </div>
              </div>

              <div className="space-y-6">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">বিজ্ঞাপন প্লেসমেন্ট মক-আপ:</span>
                
                <div className="border border-slate-200 rounded-[24px] p-6 bg-slate-50/50 space-y-4">
                  {/* Banner Slot Preview */}
                  {previewCampaign.slotType === 'top_banner' && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400">শীর্ষ ব্যানার (Top Banner) স্লট:</span>
                      <div className="w-full h-24 rounded-xl overflow-hidden relative border border-slate-100 shadow-sm group cursor-pointer">
                        <img src={previewCampaign.imageUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/70 to-transparent flex flex-col justify-center px-6">
                          <span className="text-[8px] bg-emerald-500 text-slate-900 font-black px-1.5 py-0.5 rounded uppercase self-start mb-1">Sponsored Slot</span>
                          <h4 className="text-xs font-black text-white">{previewCampaign.campaignName}</h4>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Homepage Ad Slot Preview */}
                  {previewCampaign.slotType === 'homepage' && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400">হোমপেজ স্পনসরড অফার স্লট:</span>
                      <div className="w-full h-40 rounded-2xl overflow-hidden relative border border-slate-100 shadow-sm">
                        <img src={previewCampaign.imageUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/60 flex flex-col justify-end p-5 text-white">
                          <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded uppercase self-start mb-1">PROMOTED AD</span>
                          <h4 className="text-sm font-black text-white">{previewCampaign.campaignName}</h4>
                          <span className="text-[10px] text-slate-200 mt-1 flex items-center gap-1">বিস্তারিত জানতে ক্লিক করুন <ArrowRight size={10} /></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Service Page Preview */}
                  {previewCampaign.slotType === 'service_page' && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400">সার্ভিস পেজ বিজ্ঞাপন অফার স্লট:</span>
                      <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
                        <img src={previewCampaign.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover" />
                        <div>
                          <span className="text-[8px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase">SPONSOR AD</span>
                          <h4 className="text-xs font-black text-slate-800 mt-1">{previewCampaign.campaignName}</h4>
                          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">ক্লিক করে এখনই সেবা নিন!</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sponsored Listing Preview */}
                  {previewCampaign.slotType === 'sponsored_listing' && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400">মার্কেটপ্লেস তালিকা স্পনসরড স্লট:</span>
                      <div className="p-4 bg-white rounded-3xl border-2 border-amber-300 shadow-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={previewCampaign.imageUrl} alt="" className="w-16 h-12 rounded-xl object-cover" />
                          <div>
                            <span className="text-[8px] bg-amber-500 text-slate-900 font-black px-2 py-0.5 rounded uppercase">🥇 গোল্ড স্পনসরড</span>
                            <h4 className="text-xs font-black text-slate-800 mt-1.5">{previewCampaign.campaignName}</h4>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 bg-slate-900 text-white font-black text-[9px] uppercase rounded-lg">বিস্তারিত</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                  <a
                    href={previewCampaign.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2"
                  >
                    বিজ্ঞাপন গন্তব্যে যান <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => setPreviewCampaign(null)}
                    className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default AdAdvertiserDashboard;

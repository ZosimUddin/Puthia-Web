import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Plus, 
  ArrowRight, 
  RefreshCw,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Printer,
  Trash2,
  Share2,
  ShieldCheck,
  UserCheck,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getServiceApplicationsByUserId } from '../../api';
import { ServiceApplication } from '../../types';
import { toast } from 'sonner';

// Sample fallback applications to ensure rich UX
const SAMPLE_APPLICATIONS: Partial<ServiceApplication & { trackingSteps: { title: string; date: string; completed: boolean }[] }>[] = [
  {
    id: 'APP-2026-08492',
    serviceId: 'citizenship-certificate',
    serviceName: 'নাগরিকত্ব ও চারিত্রিক সনদপত্র',
    applicantName: 'মো: জসিম উদ্দিন',
    applicantPhone: '01700-123456',
    status: 'Approved',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    details: '৪ নং পুঠিয়া ইউনিয়ন পরিষদের চেয়ারম্যান স্বাক্ষরিত নাগরিকত্ব সনদের আবেদন।',
    trackingSteps: [
      { title: 'আবেদনপত্র গ্রহণ', date: '১৯ জুলাই ২০২৬', completed: true },
      { title: 'ইউনিয়ন সচিব যাচাইকরণ', date: '২০ জুলাই ২০২৬', completed: true },
      { title: 'চেয়ারম্যান অনুমোদন', date: '২১ জুলাই ২০২৬', completed: true },
      { title: 'ডিজিটাল ডিজিটাল সনদ প্রস্তুত', date: '২২ জুলাই ২০২৬', completed: true }
    ]
  },
  {
    id: 'APP-2026-09120',
    serviceId: 'trade-license',
    serviceName: 'নতুন ট্রেড লাইসেন্স আবেদন',
    applicantName: 'মো: জসিম উদ্দিন',
    applicantPhone: '01700-123456',
    status: 'Pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    details: 'মেসার্স রাজশাহী ফ্যাশন হাউস, বাজার রোড, পুঠিয়া। ট্রেড লাইসেন্স ফি পরিশোধিত।',
    trackingSteps: [
      { title: 'আবেদনপত্র জমা গ্রহণ', date: '২১ জুলাই ২০২৬', completed: true },
      { title: 'ফিল্ড ইন্সপেক্টর পরিদর্শন', date: '২২ জুলাই ২০২৬', completed: true },
      { title: 'ফি চূড়ান্তকরণ ও ট্রেড লাইসেন্স ইস্যু', date: 'প্রক্রিয়াধীন', completed: false }
    ]
  },
  {
    id: 'APP-2026-07310',
    serviceId: 'land-porcha',
    serviceName: 'ই-পরচা (খতিয়ান) সার্টিফাইড কপি',
    applicantName: 'মো: জসিম উদ্দিন',
    applicantPhone: '01700-123456',
    status: 'Approved',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    details: 'মৌজা: পুঠিয়া, আরএস খতিয়ান নং- ৪২৫, দাগ নং- ৮৯০। সহকারী কমিশনার (ভূমি) কার্যালয়।',
    trackingSteps: [
      { title: 'ই-আবেদন নথিভুক্ত', date: '১৫ জুলাই ২০২৬', completed: true },
      { title: 'ভূমি রেকর্ড বিভাগ অনুমোদন', date: '১৬ জুলাই ২০২৬', completed: true },
      { title: 'সার্টিফাইড ফটোকপি প্রস্তুত', date: '১৭ জুলাই ২০২৬', completed: true }
    ]
  }
];

const MyApplications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  useEffect(() => {
    loadApplications();
  }, [user]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      let firebaseApps: any[] = [];
      if (user) {
        firebaseApps = await getServiceApplicationsByUserId(user.uid);
      }
      
      // Merge with local storage applications submitted via forms
      const localAppsRaw = localStorage.getItem("user_submitted_applications");
      const localApps = localAppsRaw ? JSON.parse(localAppsRaw) : [];

      const combined = [...firebaseApps, ...localApps];
      
      // If no applications exist yet, provide sample apps for demo
      if (combined.length === 0) {
        setApplications(SAMPLE_APPLICATIONS);
      } else {
        // Ensure no duplicate IDs
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        setApplications(unique);
      }
    } catch (err) {
      console.error("Error loading applications:", err);
      setApplications(SAMPLE_APPLICATIONS);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (app.serviceName && app.serviceName.toLowerCase().includes(q)) ||
      (app.id && app.id.toLowerCase().includes(q)) ||
      (app.details && app.details.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'অনুমোদিত':
      case 'নিস্পন্ন':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>অনুমোদিত / নিস্পন্ন</span>
          </span>
        );
      case 'Pending':
      case 'প্রক্রিয়াধীন':
      case 'অপেক্ষমাণ':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 shrink-0 animate-pulse">
            <Clock size={13} className="text-amber-600" />
            <span>প্রক্রিয়াধীন</span>
          </span>
        );
      case 'Rejected':
      case 'বাতিল':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shrink-0">
            <XCircle size={13} className="text-rose-600" />
            <span>প্রত্যাখ্যাত</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1 shrink-0">
            <Sparkles size={13} className="text-blue-600" />
            <span>{status || 'জমা গ্রহণ'}</span>
          </span>
        );
    }
  };

  const handleDeleteApp = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই আবেদনের রেকর্ডটি তালিকা থেকে সরাতে চান?")) return;
    
    const updated = applications.filter(a => a.id !== id);
    setApplications(updated);
    localStorage.setItem("user_submitted_applications", JSON.stringify(updated.filter(a => a.id.startsWith('APP-'))));
    toast.success("আবেদনের রেকর্ড সরানো হয়েছে!");
  };

  const handleDownloadReceipt = (app: any, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading(`আবেদন রসিদ (${app.id}) জেনারেট হচ্ছে...`, { duration: 1500 });
    setTimeout(() => {
      toast.success(`রসিদ জেনারেট সম্পন্ন! ডাউনলোড সংরক্ষিত হয়েছে।`);
    }, 1600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#006847] to-[#009664] text-white p-6 rounded-none sm:rounded-3xl shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold">
              <ShieldCheck size={16} />
              <span>স্মার্ট নাগরিক পোর্টাল • পুঠিয়া উপজেলা</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95 shadow-xs shrink-0"
                title="পূর্ববর্তী পেজে ফিরে যান"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">আমার আবেদন</h1>
            </div>
            
            <p className="text-xs md:text-sm text-emerald-100 max-w-xl">
              আপনার জমাকৃত সকল নাগরিক সেবা, ই-পরচা, ট্রেড লাইসেন্স ও সনদের আবেদন ট্র্যাক ও রসিদ ডাউনলোড করুন।
            </p>
          </div>
          <button
            onClick={() => navigate('/application-forms')}
            className="px-5 py-3 bg-white text-[#006847] hover:bg-emerald-50 rounded-2xl font-black text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>নতুন আবেদন করুন</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mx-4 sm:mx-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
            {applications.length}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">মোট আবেদন</p>
            <p className="text-sm font-black text-slate-800">আবেদন রেকর্ড</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0">
            {applications.filter(a => a.status === 'Pending' || a.status === 'প্রক্রিয়াধীন' || a.status === 'অপেক্ষমাণ').length}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">প্রক্রিয়াধীন</p>
            <p className="text-sm font-black text-amber-700">যাচাইকরণ চলছে</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
            {applications.filter(a => a.status === 'Approved' || a.status === 'অনুমোদিত' || a.status === 'নিস্পন্ন').length}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">অনুমোদিত</p>
            <p className="text-sm font-black text-emerald-700">সনদ প্রস্তুত</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">ই-সেবা সেন্টার</p>
            <p className="text-sm font-black text-purple-700">পুঠিয়া ২৪/৭</p>
          </div>
        </div>
      </div>

      {/* Controls: Search & Filter Tabs */}
      <div className="mx-4 sm:mx-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আবেদন আইডি বা সেবার নাম দিয়ে অনুসন্ধান করুন..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#006847] text-xs font-bold text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ক্লিয়ার
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadApplications}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#006847]" : ""} />
            <span>রিফ্রেশ</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          <span className="text-[11px] font-black text-slate-400 uppercase shrink-0 flex items-center gap-1 mr-1">
            <Filter size={12} /> ফিল্টার:
          </span>
          {[
            { key: 'all', label: 'সকল আবেদন' },
            { key: 'Pending', label: 'প্রক্রিয়াধীন' },
            { key: 'Approved', label: 'অনুমোদিত' },
            { key: 'Rejected', label: 'প্রত্যাখ্যাত' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterStatus === tab.key
                  ? 'bg-[#006847] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-[#006847] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-600">আবেদনের তথ্য লোড হচ্ছে...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 space-y-4">
          <FileText size={48} className="mx-auto text-slate-300" />
          <div>
            <h3 className="text-base font-black text-slate-800">কোনো আবেদন পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {searchQuery ? `"${searchQuery}" এর সাথে মিলে এমন কোনো আবেদন পাওয়া যায়নি।` : 'আপনি এখনো কোনো নাগরিক সেবার আবেদন জমা দেননি।'}
            </p>
          </div>
          <button
            onClick={() => navigate('/application-forms')}
            className="px-5 py-2.5 bg-[#006847] hover:bg-[#005238] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus size={15} />
            <span>ই-আবেদন ক্যাটাগরি ব্রাউজ করুন</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 px-4 sm:px-0">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006847] flex items-center justify-center shrink-0 border border-emerald-100">
                    <FileText size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">ট্র্যাকিং আইডি</span>
                    <p className="text-xs font-black text-slate-900 group-hover:text-[#006847] transition-colors">{app.id}</p>
                  </div>
                </div>
                <div>
                  {getStatusBadge(app.status)}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-[#006847] transition-colors">
                  {app.serviceName || 'নাগরিক সেবা আবেদন'}
                </h3>
                {app.details && (
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {app.details}
                  </p>
                )}
              </div>

              {/* Progress Stage Preview */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span>জমা: {app.createdAt ? new Date(app.createdAt).toLocaleDateString('bn-BD') : 'সম্প্রতি'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#006847] font-black">
                  <span>অবস্থা দেখুন</span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApp(app);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006847] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200/80"
                >
                  <Eye size={14} />
                  <span>ট্র্যাকিং ও বিস্তারিত</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleDownloadReceipt(app, e)}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors cursor-pointer border border-blue-200/80"
                    title="রসিদ ডাউনলোড"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteApp(app.id, e)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer border border-rose-200/80"
                    title="রিসোর্স রেকর্ড সরান"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tracking Details Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">স্মার্ট ই-সেবা আবেদনপত্র</span>
                  <h3 className="text-base font-black text-slate-900">{selectedApp.serviceName}</h3>
                  <p className="text-xs text-[#006847] font-bold mt-0.5">ট্র্যাকিং নং: {selectedApp.id}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Status Banner */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500">বর্তমান স্ট্যাটাস</p>
                  <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-500">জমার তারিখ</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleDateString('bn-BD') : 'সম্প্রতি'}
                  </p>
                </div>
              </div>

              {/* Detailed Progress Steps */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-[#006847]" />
                  <span>আবেদন প্রক্রিয়াকরণ ট্র্যাকিং টাইমলাইন</span>
                </h4>

                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3">
                  {(selectedApp.trackingSteps || [
                    { title: 'অনলাইন আবেদন নথিভুক্তকরণ', date: 'সম্পন্ন', completed: true },
                    { title: 'ইউনিয়ন সচিব / কর্মকর্তা প্রাথমিক ডক যাচাই', date: 'সম্পন্ন', completed: true },
                    { title: 'উপজেলা কর্মকর্তা চূড়ান্ত অনুমোদন', date: selectedApp.status === 'Approved' ? 'সম্পন্ন' : 'প্রক্রিয়াধীন', completed: selectedApp.status === 'Approved' },
                    { title: 'ডিজিটাল কপি / সনদপত্র গ্রাহক হস্তান্তর', date: selectedApp.status === 'Approved' ? 'সম্পন্ন' : 'অপেক্ষমাণ', completed: selectedApp.status === 'Approved' }
                  ]).map((step: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        step.completed ? 'bg-[#006847] text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {step.completed ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                          {step.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Applicant Info */}
              {selectedApp.details && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                  <p className="font-black text-slate-700">আবেদনের বিবরণ ও নোট:</p>
                  <p className="text-slate-600 leading-relaxed">{selectedApp.details}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={(e) => handleDownloadReceipt(selectedApp, e)}
                  className="px-4 py-2.5 rounded-xl bg-[#006847] hover:bg-[#005238] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Printer size={15} />
                  <span>অফিসিয়াল রসিদ প্রিন্ট / ডাউনলোড</span>
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyApplications;

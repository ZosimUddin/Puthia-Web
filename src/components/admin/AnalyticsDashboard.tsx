import React, { useState, useEffect } from "react";
import { 
  TrendingUp, Users, Eye, Search, Calendar, ArrowUpRight, ArrowDownRight,
  Loader2, RefreshCw, BarChart3, MousePointer2, Clock, FileText, Download,
  Database, Server, Cpu, HardDrive, Wifi, Activity, CheckSquare, FileSpreadsheet,
  CheckCircle2, Trash2, ChevronRight, AlertTriangle, ShieldCheck, HelpCircle,
  Building, MapPin, Zap, Flame, AlertCircle, Sparkles, Filter, PieChart as PieIcon
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie, LineChart, Line
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { getAnalyticsSummary } from "../../api";
import { AnalyticsSummary } from "../../types";

// Local Union Intelligence Interface
export interface UnionDemandIntel {
  unionName: string;
  topRequestedService: string;
  searchVolume: number;
  dataGapStatus: "পর্যাপ্ত" | "মাঝারি ঘাটতি" | "গুরুতর ঘাটতি";
  missingDataCount: number;
}

export interface ZeroResultSearch {
  query: string;
  category: string;
  count: number;
  lastSearched: string;
}

export interface AgingContent {
  title: string;
  category: string;
  lastUpdated: string;
  daysOld: number;
  status: "হালনাগাদ প্রয়োজন" | "জরুরি রিভিশন";
}

export interface FastestGrowingService {
  serviceName: string;
  category: string;
  growthRate: number; // percentage
  weeklyViews: number;
}

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'intel' | 'visitor' | 'reports' | 'server' | 'storage'>('intel');

  // Local Data Intelligence State
  const [unionDemands, setUnionDemands] = useState<UnionDemandIntel[]>([
    { unionName: "পুঠিয়া সদর", topRequestedService: "স্বাস্থ্য কমপ্লেক্স & ডাক্তার", searchVolume: 1240, dataGapStatus: "পর্যাপ্ত", missingDataCount: 2 },
    { unionName: "বানেশ্বর", topRequestedService: "হাট বাজার দর & কোল্ড স্টোরেজ", searchVolume: 1580, dataGapStatus: "মাঝারি ঘাটতি", missingDataCount: 6 },
    { unionName: "বেলপুকুরিয়া", topRequestedService: "কৃষি অফিসার & বীজ ডিলার", searchVolume: 890, dataGapStatus: "গুরুতর ঘাটতি", missingDataCount: 14 },
    { unionName: "ভালুকগাছি", topRequestedService: "নুরসারি & ডেইরি ফার্ম", searchVolume: 670, dataGapStatus: "মাঝারি ঘাটতি", missingDataCount: 8 },
    { unionName: "জিউপাড়া", topRequestedService: "পশু চিকিৎসক & পল্লী বিদ্যুৎ", searchVolume: 540, dataGapStatus: "গুরুতর ঘাটতি", missingDataCount: 11 },
    { unionName: "শিলমাড়িয়া", topRequestedService: "মৎস্য খামার & সার বিক্রেতা", searchVolume: 430, dataGapStatus: "মাঝারি ঘাটতি", missingDataCount: 5 }
  ]);

  const [zeroResultSearches, setZeroResultSearches] = useState<ZeroResultSearch[]>([
    { query: "বানেশ্বর কোল্ড স্টোরেজ ফোন নম্বর", category: "কৃষি & ব্যবসা", count: 88, lastSearched: "১০ মিনিট আগে" },
    { query: "বেলপুকুরিয়া পশু ডাক্তার মোবাইল", category: "প্রাণিসম্পদ", count: 64, lastSearched: "৩০ মিনিট আগে" },
    { query: "শিলমাড়িয়া ইউনিয়ন ডিজিটাল সেন্টার ভিডিও", category: "ডিজিটাল সেবা", count: 42, lastSearched: "১ ঘণ্টা আগে" },
    { query: "জিউপাড়া খাস জমি ইজারা বিজ্ঞপ্তি", category: "ভূমি সেবা", count: 35, lastSearched: "২ ঘণ্টা আগে" }
  ]);

  const [agingContent, setAgingContent] = useState<AgingContent[]>([
    { title: "বানেশ্বর বাজারের সাপ্তাহিক পাইকারি দরপত্র", category: "কৃষি বাজার", lastUpdated: "২০২৬-০১-০৫", daysOld: 43, status: "জরুরি রিভিশন" },
    { title: "উপজেলা পোল্ট্রি টিকাদান ও প্রশিক্ষণ সময়সূচী", category: "প্রাণিসম্পদ", lastUpdated: "২০২৬-০১-১২", daysOld: 36, status: "হালনাগাদ প্রয়োজন" },
    { title: "পুঠিয়া সাংস্কৃতিক কেন্দ্র অনুষ্ঠান সময়সূচী", category: "সংস্কৃতি", lastUpdated: "২০২৬-০১-২০", daysOld: 28, status: "হালনাগাদ প্রয়োজন" }
  ]);

  const [fastestGrowing, setFastestGrowing] = useState<FastestGrowingService[]>([
    { serviceName: "জরুরি রক্তদাতা ও ডোনার তালিকা", category: "স্বাস্থ্য সেবা", growthRate: 145, weeklyViews: 2840 },
    { serviceName: "পুঠিয়া রাজবাড়ি টিকিট ও নির্দেশিকা", category: "পর্যটন", growthRate: 112, weeklyViews: 2150 },
    { serviceName: "বানেশ্বর কাঁচাবাজারের দৈনিক দর", category: "কৃষি বাজার", growthRate: 98, weeklyViews: 1920 },
    { serviceName: "বাসা ভাড়া ও মেস ইনফরমার", category: "রেন্টাল", growthRate: 85, weeklyViews: 1640 }
  ]);

  const [lowDataServices, setLowDataServices] = useState([
    { service: "বেলপুকুরিয়া ইউনিয়ন ডিজিটাল সেন্টার প্যানেল", currentEntries: 2, recommended: 15, deficitScore: "হাই ঘাটতি" },
    { service: "জিউপাড়া বীজ ডিলার ও সার বিক্রেতা ডিরেক্টরি", currentEntries: 4, recommended: 20, deficitScore: "হাই ঘাটতি" },
    { service: "ভালুকগাছি ডেইরি ফার্ম ও খামার তালিকা", currentEntries: 5, recommended: 25, deficitScore: "মিডিয়াম ঘাটতি" }
  ]);

  // Server Status Live Simulation state
  const [serverStats, setServerStats] = useState({
    cpu: 12.5,
    ram: 1.22,
    latency: 32,
    uptime: "৯৯.৯৮%",
    history: Array.from({ length: 15 }, (_, i) => ({ time: `${i + 1}m`, latency: 30 + Math.floor(Math.random() * 8) }))
  });

  const [storageBreakdown, setStorageBreakdown] = useState([
    { name: "মিডিয়া ফাইল ও ছবি", value: 245.8, color: "#10b981" },
    { name: "ইউজার ডাটাবেস", value: 38.2, color: "#3b82f6" },
    { name: "নোটিশ ও ঘোষণা", value: 12.4, color: "#f59e0b" },
    { name: "সিস্টেম লগ ও ক্যাশ", value: 68.6, color: "#ec4899" }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAnalyticsSummary();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4 text-[#006a4e]" size={40} />
        <p className="font-bold text-slate-700">লোকাল ডাটা ইন্টেলিজেন্স ড্যাশবোর্ড লোড হচ্ছে...</p>
      </div>
    );
  }

  const currentSummary = summary || {
    todayVisitors: 482,
    totalViews: 18450,
    searchCount: 210,
    weeklyVisits: [
      { date: "2026-08-11", count: 280 },
      { date: "2026-08-12", count: 340 },
      { date: "2026-08-13", count: 310 },
      { date: "2026-08-14", count: 420 },
      { date: "2026-08-15", count: 580 },
      { date: "2026-08-16", count: 510 },
      { date: "2026-08-17", count: 482 }
    ],
    popularPages: [
      { path: "/hospital", count: 1820 },
      { path: "/restaurants", count: 1450 },
      { path: "/tourism", count: 1210 },
      { path: "/house-rent", count: 980 },
      { path: "/jobs", count: 850 }
    ],
    popularSearches: [
      { query: "উপজেলা চেয়ারম্যান যোগাযোগ", count: 142 },
      { query: "জরুরি রক্তদান ও ও+", count: 118 },
      { query: "বানেশ্বর হাটের আম ও পেঁয়াজ দর", count: 95 },
      { query: "রাজবাড়ি ইতিহাস ও টিকেট", count: 84 }
    ]
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden text-slate-800">
      
      {/* Header Banner - Full Width Cohesive Card */}
      <div className="w-full bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 p-6 sm:p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 rounded-3xl border border-emerald-700/50">
        <div className="space-y-2 max-w-3xl">
          <span className="px-3 py-1 bg-white/20 border border-white/20 text-white text-xs font-black rounded-full uppercase inline-flex items-center gap-1.5 shadow-xs">
            <Sparkles size={14} className="text-emerald-300" /> Admin Data Intelligence Hub
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">লোকাল ডাটা ইন্টেলিজেন্স ড্যাশবোর্ড</h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
            পুঠিয়ার ৬টি ইউনিয়নের নাগরিক চাহিদা, অনুসন্ধানের শূন্য ফলাফল, তথ্যের ঘাটতি ও দ্রুত বর্ধনশীল সেবাসমূহের রিয়েল-টাইম ডাটা
          </p>
        </div>

        <button 
          onClick={fetchData}
          className="px-6 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
        >
          <RefreshCw size={15} className={loading ? "animate-spin text-emerald-700" : "text-emerald-700"} /> সিঙ্ক ইন্টেলিজেন্স
        </button>
      </div>

      {/* Sub Tab Navigation - Full Width Bar */}
      <div className="w-full">
        <div className="flex items-center gap-2 bg-emerald-50/70 p-2 rounded-2xl border border-emerald-100 overflow-x-auto no-scrollbar shadow-xs">
          {[
            { id: 'intel', label: '📊 ডিরেক্টরি ও ইন্টেলিজেন্স', icon: BarChart3 },
            { id: 'visitor', label: '👥 ভিজিটর অ্যানালিটিক্স', icon: TrendingUp },
            { id: 'reports', label: '📁 সিস্টেম রিপোর্টস', icon: FileText },
            { id: 'server', label: '⚡ সার্ভার স্বাস্থ্য', icon: Server }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer shrink-0 min-w-max ${
                activeSubTab === tab.id
                ? "bg-emerald-700 text-white shadow-md font-black"
                : "text-emerald-900 hover:bg-emerald-100/80 hover:text-emerald-950"
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content Container */}
      <div className="w-full space-y-8">
        {/* TAB 1: LOCAL DATA INTELLIGENCE */}
        {activeSubTab === 'intel' && (
          <div className="space-y-8">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">সবচেয়ে সার্চকৃত সেবা</span>
              <h4 className="text-base font-black text-slate-900">জরুরি স্বাস্থ্য ও ডাক্তার</h4>
              <span className="text-xs font-bold text-emerald-600">১,৮২০টি মাসিক ভিউ</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">সর্বোচ্চ চাহিদাসম্পন্ন ইউনিয়ন</span>
              <h4 className="text-base font-black text-slate-900">বানেশ্বর ইউনিয়ন</h4>
              <span className="text-xs font-bold text-amber-600">১,৫৮০টি লোকাল রিকোয়েস্ট</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">শূন্য ফলাফল সার্চের সংখ্যা</span>
              <h4 className="text-base font-black text-rose-600">২২৯টি সার্চ</h4>
              <span className="text-xs font-bold text-slate-500">তথ্য যুক্ত করা প্রয়োজন</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">সর্বোচ্চ বর্ধনশীল সেবা</span>
              <h4 className="text-base font-black text-slate-900">রক্তদাতা নেটওয়ার্ক</h4>
              <span className="text-xs font-bold text-emerald-600">১৪৫% সাপ্তাহিক প্রবৃদ্ধি</span>
            </div>
          </div>

          {/* Union Wise Service Demand & Data Deficit */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building size={18} className="text-emerald-700" />
                  ইউনিয়নভিত্তিক সেবা চাহিদা ও তথ্যের ঘাটতি
                </h3>
                <p className="text-xs text-slate-500 font-bold">পুঠিয়ার ৬টি ইউনিয়নে কোন সেবা সবচেয়ে বেশি প্রয়োজন এবং কোথায় এন্ট্রি কম</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-black border border-emerald-200">
                Union Analytics
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left min-w-[650px] text-xs font-bold text-slate-700">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase">
                    <th className="py-3 px-4">ইউনিয়ন</th>
                    <th className="py-3 px-4">শীর্ষ কাঙ্ক্ষিত সেবা</th>
                    <th className="py-3 px-4 text-center">অনুসন্ধান সংখ্যা</th>
                    <th className="py-3 px-4 text-center">তথ্যের ঘাটতি স্থিতি</th>
                    <th className="py-3 px-4 text-right">অনুপস্থিত তথ্য সংখ্যা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unionDemands.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-black text-slate-900">{u.unionName}</td>
                      <td className="py-4 px-4 text-emerald-800 font-black">{u.topRequestedService}</td>
                      <td className="py-4 px-4 text-center font-black">{u.searchVolume}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          u.dataGapStatus === 'পর্যাপ্ত' ? 'bg-emerald-100 text-emerald-800' :
                          u.dataGapStatus === 'মাঝারি ঘাটতি' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.dataGapStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-black text-rose-600">
                        {u.missingDataCount}টি সার্ভিস কম
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grid 2 Columns: Zero-Result Searches & Low Data Services */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Zero Result Searches */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-600" />
                    যেসব অনুসন্ধানের ফলাফল পাওয়া যাচ্ছে না (Zero Result Searches)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold">নাগরিকরা সার্চ করছেন কিন্তু ডাটাবেজে তথ্য নেই</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 space-y-1">
                {zeroResultSearches.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-black text-slate-900">“{item.query}”</h4>
                      <span className="text-[10px] text-slate-400 font-bold">{item.category} • {item.lastSearched}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-black text-[11px]">
                      {item.count} বার সার্চড
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Content Services */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-600" />
                  কম তথ্য থাকা সেবাসমূহ (Low Data Services)
                </h3>
                <p className="text-[11px] text-slate-500 font-bold">যেসব ক্যাটাগরিতে তথ্য যুক্ত করা আশু প্রয়োজন</p>
              </div>

              <div className="divide-y divide-slate-100 space-y-1">
                {lowDataServices.map((lds, idx) => (
                  <div key={idx} className="py-3 space-y-1 text-xs">
                    <div className="flex justify-between items-center font-black">
                      <span className="text-slate-900">{lds.service}</span>
                      <span className="text-rose-600 text-[11px]">{lds.deficitScore}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>বর্তমান এন্ট্রি: {lds.currentEntries}টি</span>
                      <span>প্রস্তাবিত এন্ট্রি: {lds.recommended}টি</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Grid 2 Columns: Aging Content & Rapidly Growing Services */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Aging Content */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Clock size={16} className="text-amber-600" />
                  পুরোনো হয়ে যাওয়া তথ্য (Aging Content)
                </h3>
                <p className="text-[11px] text-slate-500 font-bold">অনেকদিন ধরে আপডেট না করা এন্ট্রিগুলো চিহ্নিত করুন</p>
              </div>

              <div className="divide-y divide-slate-100 space-y-1">
                {agingContent.map((ac, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-black text-slate-900">{ac.title}</h4>
                      <span className="text-[10px] text-slate-400 font-bold">শেষ আপডেট: {ac.lastUpdated} ({ac.daysOld} দিন পূর্বে)</span>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-black text-[10px]">
                      {ac.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rapidly Growing Services */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-600" />
                  দ্রুত জনপ্রিয় হওয়া সেবা (Fastest Growing Services)
                </h3>
                <p className="text-[11px] text-slate-500 font-bold">বিগত ৭ দিনে যাদের ভিউ ও ট্রাফিক সবচেয়ে দ্রুত বেড়েছে</p>
              </div>

              <div className="divide-y divide-slate-100 space-y-1">
                {fastestGrowing.map((fg, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-black text-slate-900">{fg.serviceName}</h4>
                      <span className="text-[10px] text-slate-400 font-bold">{fg.category} • {fg.weeklyViews} সাপ্তাহিক ভিউ</span>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-black text-[11px]">
                      +{fg.growthRate}% বৃদ্ধি
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: VISITOR ANALYTICS */}
      {activeSubTab === 'visitor' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-6">
            <h3 className="text-base font-black text-slate-900">সাপ্তাহিক ট্রাফিক ও ভিজিটর ট্রেন্ড</h3>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentSummary.weeklyVisits}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006a4e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#006a4e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#006a4e" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM REPORTS */}
      {activeSubTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900">সিস্টেম ইন্টেলিজেন্স রিপোর্ট ডাউনলোড</h3>
          <p className="text-xs text-slate-500 font-bold">নাগরিক ব্যবহারের তথ্যের পিডিএফ বা সিএসভি রিপোর্ট তৈরি করুন</p>
          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <button onClick={() => alert("রিপোর্ট ডাউনলোড শুরু হয়েছে...")} className="px-5 py-2.5 bg-[#006a4e] text-white rounded-xl text-xs font-black shadow-md cursor-pointer">
              📥 সাপ্তাহিক ডাটা সামারি (PDF)
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: SERVER HEALTH */}
      {activeSubTab === 'server' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900">সার্ভার হেলথ ও লেটেন্সি রিয়েলটাইম মনিটর</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-black block">সিপিইউ লোড</span>
              <span className="text-xl font-black text-slate-900">{serverStats.cpu}%</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-black block">র্যাম ব্যবহার</span>
              <span className="text-xl font-black text-slate-900">{serverStats.ram} GB</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-black block">নেটওয়ার্ক লেটেন্সি</span>
              <span className="text-xl font-black text-emerald-700">{serverStats.latency} ms</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-black block">আপটাইম</span>
              <span className="text-xl font-black text-emerald-800">{serverStats.uptime}</span>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

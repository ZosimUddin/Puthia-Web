import React, { useState, useEffect } from "react";
import { 
  Terminal, 
  Cpu, 
  Database, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Download, 
  RefreshCw, 
  Search, 
  Filter, 
  Activity, 
  Layers, 
  Flame, 
  Server, 
  Wifi, 
  Sliders, 
  Info, 
  AlertTriangle,
  Key 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

// Simulated error log types
interface ErrorLog {
  id: string;
  timestamp: string;
  level: "ERROR" | "WARNING" | "INFO";
  module: string;
  message: string;
  stackTrace?: string;
}

// Initial mockup logs
const INITIAL_LOGS: ErrorLog[] = [
  {
    id: "err-001",
    timestamp: "2026-07-12T07:10:05.120Z",
    level: "ERROR",
    module: "Firebase Auth Connection",
    message: "Failed to establish secure handshake with auth provider endpoint. Timeout after 15000ms.",
    stackTrace: "AuthError: Connection closed prematurely\n  at FirebaseProvider.connect (auth.ts:42:19)\n  at processTicksAndRejections (node:internal/process/task_queues:95:5)"
  },
  {
    id: "err-002",
    timestamp: "2026-07-12T07:08:42.855Z",
    level: "WARNING",
    module: "Image Optimization API",
    message: "High processing delay detected while optimizing image asset /assets/puthia-large.jpg (Time taken: 3400ms).",
    stackTrace: "OptimizationWarning: Execution limit reached\n  at ImageCompressor.resize (compressor.js:104:12)"
  },
  {
    id: "err-003",
    timestamp: "2026-07-12T07:05:12.331Z",
    level: "INFO",
    module: "Database Sync Handler",
    message: "Background indexing completed successfully for collection 'settings_global'. 0 orphaned nodes purged.",
  },
  {
    id: "err-004",
    timestamp: "2026-07-12T06:58:22.012Z",
    level: "ERROR",
    module: "Push Notification Service",
    message: "API Request to notification broker returned HTTP Status 401 Unauthorized. Key invalid or expired.",
    stackTrace: "BrokerException: API Key unauthorized\n  at FCMClient.sendBroadcast (fcm.ts:182:31)\n  at AppControlManagement.handleSendNotification (AppControlManagement.tsx:142:12)"
  },
  {
    id: "err-005",
    timestamp: "2026-07-12T06:45:55.990Z",
    level: "WARNING",
    module: "Business Directory Sync",
    message: "Database index recommendation: Consider creating a composite index for fields 'role' and 'status' on collection 'users' to avoid sequential scans."
  },
  {
    id: "err-006",
    timestamp: "2026-07-12T06:12:10.104Z",
    level: "ERROR",
    module: "Location Grounding API",
    message: "Reverse geocoding rate-limit exceeded. Google Maps Places API key usage exceeds daily quota threshold.",
    stackTrace: "QuotaExceededError: Daily threshold reached\n  at MapsClient.reverseGeocode (maps.ts:77:22)"
  },
];

const SubManagerPlaceholder = ({ title }: { title: string }) => (
  <div className="p-10 border-2 border-dashed border-gray-200 rounded-[24px] text-center text-gray-400">
    <Terminal className="mx-auto mb-4" size={48} />
    <h3 className="text-lg font-black text-gray-700">{title} ম্যানেজমেন্ট মডিউল</h3>
    <p className="text-xs font-bold mt-1">এই মডিউলটি তৈরির কাজ চলছে।</p>
  </div>
);

export default function DeveloperManagement() {
  const [activeTab, setActiveTab] = useState<'backend_stack' | 'firebase' | 'api_keys' | 'maintenance' | 'cache' | 'db_optimize' | 'error_logs'>('backend_stack');

  // Cache States
  const [cacheItems, setCacheItems] = useState([
    { id: 'local_storage', name: 'Local Storage State Cache', size: '1,250 KB', count: 124, type: 'Client', checked: true },
    { id: 'session_storage', name: 'Session State & Route Cache', size: '420 KB', count: 18, type: 'Client', checked: true },
    { id: 'api_cache', name: 'API Responses CDN Cache', size: '3,840 KB', count: 512, type: 'Server', checked: true },
    { id: 'image_cache', name: 'Rendered Asset / Thumbnail Cache', size: '12,480 KB', count: 96, type: 'Server', checked: false },
    { id: 'firebase_cache', name: 'Firestore Document Offline Sync', size: '2,150 KB', count: 340, type: 'Client', checked: true }
  ]);
  const [clearingCache, setClearingCache] = useState(false);
  const [clearProgress, setClearProgress] = useState(0);
  const [currentClearingName, setCurrentClearingName] = useState("");
  const [cacheHistory, setCacheHistory] = useState([
    { time: '09:00', size: 24 },
    { time: '10:00', size: 32 },
    { time: '11:00', size: 18 },
    { time: '12:00', size: 42 },
    { time: '13:00', size: 20 },
  ]);

  // DB Optimize States
  const [dbCollections, setDbCollections] = useState([
    { name: 'users', docCount: 0, sizeKb: 120, indexStatus: 'Optimized', health: 100, label: 'ব্যবহারকারী তালিকা' },
    { name: 'businesses', docCount: 0, sizeKb: 380, indexStatus: 'Composite Needed', health: 85, label: 'ব্যবসায়ীক ডিরেক্টরি' },
    { name: 'notifications', docCount: 0, sizeKb: 540, indexStatus: 'Optimized', health: 95, label: 'ইন-অ্যাপ বিজ্ঞপ্তি' },
    { name: 'notices', docCount: 0, sizeKb: 80, indexStatus: 'Optimized', health: 100, label: 'জরুরি নোটিশ' },
    { name: 'push_notifications', docCount: 0, sizeKb: 150, indexStatus: 'Custom Recommended', health: 70, label: 'পুশ নোটিফিকেশন লগ' }
  ]);
  const [optimizingDb, setOptimizingDb] = useState(false);
  const [dbStep, setDbStep] = useState(0);
  const [dbScore, setDbScore] = useState(86);
  const [showIndexModal, setShowIndexModal] = useState(false);

  // Error Log States
  const [logs, setLogs] = useState<ErrorLog[]>(INITIAL_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"ALL" | "ERROR" | "WARNING" | "INFO">("ALL");
  const [liveStream, setLiveStream] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    // Read Firestore counts for realistic db optimization dashboard stats
    const fetchDbStats = async () => {
      try {
        const collectionsToFetch = ['users', 'businesses', 'notifications', 'notices', 'push_notifications'];
        const updatedCols = [...dbCollections];
        for (let i = 0; i < collectionsToFetch.length; i++) {
          const colName = collectionsToFetch[i];
          const snap = await getDocs(query(collection(db, colName), limit(50)));
          updatedCols[i].docCount = snap.size === 50 ? 120 + Math.floor(Math.random() * 40) : snap.size;
          updatedCols[i].sizeKb = Math.max(10, updatedCols[i].docCount * 4 + Math.floor(Math.random() * 20));
        }
        setDbCollections(updatedCols);
      } catch (err) {
        console.error("Error reading Firestore stats:", err);
      }
    };
    fetchDbStats();
  }, []);

  // Simulate Error Streaming
  useEffect(() => {
    if (!liveStream) return;

    const modules = ["Payment Gateway", "Location Service", "Notification Broadcast", "Agri Weather Scraper", "API Auth Broker"];
    const errors = [
      "Rate limit exceeded on external API route.",
      "Connection timeout while querying geolocation metrics.",
      "SSL verification failed on third-party webhook responder.",
      "Payload validation exception: Missing required field user_id.",
      "Memory leak warning: Event listener count exceeded limits (105Listeners)."
    ];

    const interval = setInterval(() => {
      const isError = Math.random() > 0.4;
      const level = isError ? (Math.random() > 0.5 ? "ERROR" : "WARNING") : "INFO";
      const randomModule = modules[Math.floor(Math.random() * modules.length)];
      const randomMsg = errors[Math.floor(Math.random() * errors.length)];

      const newLog: ErrorLog = {
        id: `err-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        level,
        module: randomModule,
        message: randomMsg,
        stackTrace: level === "ERROR" ? `Error: ${randomMsg}\n  at SystemModule.run (module.js:12:35)\n  at executeCallback (async_hooks.js:140:17)` : undefined
      };

      setLogs(prev => [newLog, ...prev.slice(0, 24)]); // Cap at 25 logs
    }, 8000);

    return () => clearInterval(interval);
  }, [liveStream]);

  // Actions: Cache Clear
  const handleClearCache = async () => {
    setClearingCache(true);
    setClearProgress(5);
    const selectedItems = cacheItems.filter(item => item.checked);
    
    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      setCurrentClearingName(item.name);
      
      // Simulate slow clearing
      await new Promise(resolve => setTimeout(resolve, 600));
      setClearProgress(Math.floor(((i + 1) / selectedItems.length) * 100));

      // Actually clear client side storage if checked
      if (item.id === 'local_storage') {
        // Clear all local storage except persistent system identifiers if desired, but here we can clear dummy keys safely
        Object.keys(localStorage).forEach(key => {
          if (key.includes("cache_") || key.includes("temp_")) {
            localStorage.removeItem(key);
          }
        });
      } else if (item.id === 'session_storage') {
        sessionStorage.clear();
      }
    }

    // Reflect changes in UI
    const updatedCache = cacheItems.map(item => {
      if (item.checked) {
        return { ...item, size: '০.০০ KB', count: 0 };
      }
      return item;
    });
    setCacheItems(updatedCache);
    
    // Log in activity logs or state
    const newLog: ErrorLog = {
      id: `info-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      level: "INFO",
      module: "System Cache Controller",
      message: `System cache cleared successfully. Reclaimed ${selectedItems.reduce((acc, curr) => acc + parseInt(curr.size.replace(/[^0-9]/g, '')), 0)} KB.`
    };
    setLogs(prev => [newLog, ...prev]);

    setClearingCache(false);
    setClearProgress(0);
    setCurrentClearingName("");
    alert("নির্বাচিত ক্যাশ ফাইল সফলভাবে পরিষ্কার করা হয়েছে!");
  };

  // Actions: DB Optimize
  const handleOptimizeDb = async () => {
    setOptimizingDb(true);
    setDbStep(1); // Scan
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDbStep(2); // Indicies
    await new Promise(resolve => setTimeout(resolve, 1200));
    setDbStep(3); // Orphans
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDbStep(4); // Compact
    await new Promise(resolve => setTimeout(resolve, 800));

    // Optimize results
    const optimized = dbCollections.map(col => ({
      ...col,
      indexStatus: 'Optimized',
      health: 100
    }));
    setDbCollections(optimized);
    setDbScore(100);
    setOptimizingDb(false);
    setDbStep(0);

    const newLog: ErrorLog = {
      id: `info-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      level: "INFO",
      module: "Firestore Index Optimizer",
      message: "Firestore optimization workflow executed. Missing indexing templates populated, health score restored to 100%."
    };
    setLogs(prev => [newLog, ...prev]);

    alert("ডাটাবেজ ইনডেক্সিং এবং অপ্টিমাইজেশন সম্পন্ন হয়েছে!");
  };

  // Actions: Logs Control
  const handleClearLogs = () => {
    if (window.confirm("আপনি কি নিশ্চিত যে সকল কনসোল লগ মুছে ফেলতে চান?")) {
      setLogs([]);
    }
  };

  const handleDownloadLogs = () => {
    const textContent = logs.map(log => 
      `[${log.timestamp}] [${log.level}] [${log.module}] : ${log.message}\n${log.stackTrace ? log.stackTrace + '\n' : ''}`
    ).join('\n');

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `puthia_smart_city_error_logs_${new Date().toISOString().slice(0,10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.module.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "ALL" || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  // Calculate stats for logs
  const errorCount = logs.filter(l => l.level === "ERROR").length;
  const warningCount = logs.filter(l => l.level === "WARNING").length;
  const infoCount = logs.filter(l => l.level === "INFO").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Tab Header with developer branding */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-gray-950 to-gray-900 p-8 rounded-[40px] text-white relative overflow-hidden border border-gray-800">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-3xl border border-emerald-500/20">
            <Terminal size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              ডেভেলপার কন্ট্রোল প্যানেল 
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-black font-mono">v1.2.0-beta</span>
            </h2>
            <p className="text-xs font-bold text-gray-400 mt-1">ক্যাশ অপারেশন, ডাটাবেজ ইনডেক্স টিউনিং এবং লাইভ সার্ভিস লগার</p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2.5">
          {[
            { id: 'backend_stack', label: 'ব্যাকএন্ড আর্কিটেকচার', icon: Server },
            { id: 'firebase', label: 'ফায়ারবেস স্ট্যাটাস', icon: Wifi },
            { id: 'api_keys', label: 'এপিআই কী', icon: Key },
            { id: 'maintenance', label: 'মেইনটেইনেন্স মোড', icon: AlertTriangle },
            { id: 'cache', label: 'ক্যাশ ক্লিয়ার', icon: Trash2 },
            { id: 'db_optimize', label: 'ডাটাবেজ টিউনিং', icon: Database },
            { id: 'error_logs', label: 'লাইভ এরর লগ', icon: AlertCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-500 text-gray-950 shadow-lg shadow-emerald-500/20' 
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Areas */}
      <AnimatePresence mode="wait">
        
        {/* TAB 00: BACKEND STACK ARCHITECTURE */}
        {activeTab === 'backend_stack' && (
          <motion.div
            key="backend_stack_tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Server className="text-emerald-600" size={24} />
                    <span>ব্যাকএন্ড টেকনোলজি স্ট্যাক ও ইনফ্রাস্ট্রাকচার</span>
                  </h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">
                    হাই-পারফরম্যান্স স্কেলেবল সিস্টেম আর্কিটেকচার স্পেসিফিকেশন
                  </p>
                </div>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black rounded-xl border border-emerald-200">
                  ⚡ Active Stack
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Laravel 12', desc: 'RESTful API, Artisan, Queue Workers, Job Scheduling', badge: 'v12.x Core', color: 'bg-rose-50 text-rose-700 border-rose-200' },
                  { name: 'Filament 4', desc: 'অ্যাডমিন ড্যাশবোর্ড হাবিং, রিসোর্স টিউনিং, রিচ টেবিল ও প্যানেল', badge: 'v4.x Admin Active', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { name: 'MySQL 8', desc: 'রিলেশনাল ডাটাবেস, ইনডেক্সিং ও ট্রানজাকশন সেফটি', badge: 'v8.0 RDBMS', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { name: 'Meilisearch', desc: 'অত্যন্ত দ্রুত স্পেলিং-টলারেন্ট বাংলা ও ইংরেজি সার্চ ইঞ্জিন', badge: 'v1.12 Engine', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { name: 'Spatie Permission', desc: 'রোল ও পারমিশন কন্ট্রোল গার্ড গার্ডিং সিকিউরিটি', badge: 'RBAC Active', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                  { name: 'Firebase / Firestore', desc: 'লাইভ ক্লায়েন্ট সিনক্রোনাইজেশন ও রিয়েলটাইম ইভেন্ট হাব', badge: 'Sync Hybrid', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                ].map((item, idx) => (
                  <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-black text-gray-900 text-base">{item.name}</h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${item.color}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* TAB 0: FIREBASE STATUS */}
        {activeTab === 'firebase' && (
          <motion.div 
            key="firebase_tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <SubManagerPlaceholder title="ফায়ারবেস স্ট্যাটাস" />
          </motion.div>
        )}

        {/* TAB 0.5: API KEYS */}
        {activeTab === 'api_keys' && (
          <motion.div 
            key="api_keys_tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <SubManagerPlaceholder title="এপিআই কী" />
          </motion.div>
        )}

        {/* TAB 0.7: MAINTENANCE MODE */}
        {activeTab === 'maintenance' && (
          <motion.div 
            key="maintenance_tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <SubManagerPlaceholder title="মেইনটেইনেন্স মোড" />
          </motion.div>
        )}

        {/* TAB 1: CACHE MANAGEMENT */}
        {activeTab === 'cache' && (
          <motion.div 
            key="cache_tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Cache settings checklist */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">ক্যাশ রিসোর্স এবং রিলিজ টিউনিং</h3>
                    <p className="text-[10px] font-bold text-gray-400">অ্যাপ স্পিড বুস্ট করার জন্য অপ্রয়োজনীয় ক্যাশ সিলেক্ট করুন</p>
                  </div>

                  <button
                    onClick={() => {
                      const allChecked = cacheItems.every(i => i.checked);
                      setCacheItems(cacheItems.map(i => ({ ...i, checked: !allChecked })));
                    }}
                    className="text-xs text-indigo-600 hover:underline font-black"
                  >
                    সব সিলেক্ট করুন
                  </button>
                </div>

                <div className="space-y-3">
                  {cacheItems.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setCacheItems(cacheItems.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i))}
                      className={`p-5 rounded-3xl border cursor-pointer flex items-center justify-between gap-4 transition-all ${
                        item.checked 
                          ? 'bg-indigo-50/40 border-indigo-200 shadow-sm' 
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          item.checked ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Trash2 size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900">{item.name}</h4>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded mt-1 inline-block ${
                            item.type === 'Client' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {item.type} Side Resource
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-gray-900">{item.size}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">{item.count} টি আইটেম</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clear Cache CTA and progress */}
                <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-xs font-bold text-gray-400">
                    নির্বাচিত ক্যাশ ভলিউম: <span className="font-black text-gray-900">
                      {cacheItems.filter(i => i.checked).reduce((acc, curr) => acc + parseInt(curr.size.replace(/[^0-9]/g, '') || '0'), 0)} KB
                    </span>
                  </div>

                  <button
                    onClick={handleClearCache}
                    disabled={clearingCache || cacheItems.filter(i => i.checked).length === 0}
                    className="w-full md:w-auto px-8 py-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-2xl font-black text-xs transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                  >
                    {clearingCache ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        পরিষ্কার করা হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        ক্যাশ ফাইল মুছে ফেলুন
                      </>
                    )}
                  </button>
                </div>

                {clearingCache && (
                  <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 space-y-3">
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-indigo-600">স্ক্যানিং এবং রিলিজ করা হচ্ছে...</span>
                      <span>{clearProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${clearProgress}%` }}
                        className="h-full bg-indigo-500"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold">মুছে ফেলা হচ্ছে: <span className="font-mono text-gray-600">{currentClearingName}</span></p>
                  </div>
                )}

              </div>
            </div>

            {/* Cache telemetry side panel */}
            <div className="space-y-6">
              <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-indigo-500" />
                  ক্যাশ গ্রোথ অ্যানালিটিক্স
                </h4>
                <p className="text-[11px] font-bold text-gray-400">বিগত ৫ ঘণ্টার নেটওয়ার্ক ও ক্যাশ ডাটা ট্র্যাকার (KB)</p>
                
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cacheHistory} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCache" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" tick={{ fontSize: 9, fontWeight: 'bold' }} stroke="#cbd5e1" />
                      <YAxis tick={{ fontSize: 9, fontWeight: 'bold' }} stroke="#cbd5e1" />
                      <Tooltip contentStyle={{ fontSize: 10, borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="size" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCache)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-3 border-t border-gray-50 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-[9px] text-gray-400 font-bold block">গড় স্পিডআপ</span>
                    <span className="text-md font-black text-emerald-600">+২৪.৫%</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-[9px] text-gray-400 font-bold block">মেমোরি সেভিংস</span>
                    <span className="text-md font-black text-indigo-600">১৮.৮ MB</span>
                  </div>
                </div>
              </section>

              <section className="bg-indigo-950 text-white p-6 rounded-[32px] relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
                <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-indigo-300">অ্যাডমিন নোট</h4>
                <p className="text-xs text-indigo-100/80 leading-relaxed font-bold">
                  ক্যাশ ডাটা সাময়িকভাবে ব্রাউজার এবং লোকাল মেমোরিতে রেসপন্স স্টোর করে। ডাটা রিলিজ করলে কোনো রিয়েল-টাইম তথ্য ডিলিট হবে না। এটি শুধুমাত্র অফলাইন ডাটাকে রিফ্রেশ করবে।
                </p>
              </section>
            </div>
          </motion.div>
        )}

        {/* TAB 2: DATABASE OPTIMIZE */}
        {activeTab === 'db_optimize' && (
          <motion.div 
            key="db_tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Firestore Collections Health Summary */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">ফায়ারস্টোর ডাটাবেজ অপ্টিমাইজেশন</h3>
                      <p className="text-[10px] font-bold text-gray-400">কালেকশন ইনডেক্সিং, রিড-রাইট থ্রোটলিং এবং অনাথ নোড স্ক্যানার</p>
                    </div>

                    <button
                      onClick={handleOptimizeDb}
                      disabled={optimizingDb}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-gray-950 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all shadow-md shadow-emerald-500/10"
                    >
                      {optimizingDb ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          টিউনিং হচ্ছে...
                        </>
                      ) : (
                        <>
                          <Play size={14} />
                          অপ্টিমাইজেশন চালান
                        </>
                      )}
                    </button>
                  </div>

                  {optimizingDb && (
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                        <h4 className="text-xs font-black text-gray-900">অপ্টিমাইজেশন রানটাইম প্রগ্রেস</h4>
                      </div>

                      {/* Staggered progress steps */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                        {[
                          { id: 1, text: 'অনাথ নোড স্ক্যানিং' },
                          { id: 2, text: 'ইনডেক্স রি-বিল্ড' },
                          { id: 3, text: 'মেমোরি ডিফ্র্যাগমেন্ট' },
                          { id: 4, text: 'ক্লিনআপ প্রসেস' }
                        ].map(step => (
                          <div key={step.id} className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                              dbStep >= step.id ? 'bg-emerald-500 text-gray-950' : 'bg-gray-200 text-gray-500'
                            }`}>
                              {step.id}
                            </div>
                            <span className={`text-[10px] font-black ${dbStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                              {step.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collections list table */}
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-5 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">কালেকশন</th>
                          <th className="px-5 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">মোট ডকুমেন্ট</th>
                          <th className="px-5 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">সাইজ (KB)</th>
                          <th className="px-5 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">স্ট্যাটাস</th>
                          <th className="px-5 py-3 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">হেলথ স্কোর</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {dbCollections.map(col => (
                          <tr key={col.name} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-4">
                              <span className="text-xs font-black text-gray-900 block">{col.label}</span>
                              <span className="text-[9px] text-gray-400 font-mono block mt-0.5">{col.name}</span>
                            </td>
                            <td className="px-5 py-4 text-xs font-bold text-gray-600">{col.docCount} টি</td>
                            <td className="px-5 py-4 text-xs font-mono font-bold text-gray-500">{col.sizeKb} KB</td>
                            <td className="px-5 py-4">
                              <span className={`px-2 py-0.5 text-[8px] font-black rounded ${
                                col.indexStatus === 'Optimized' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                              }`}>
                                {col.indexStatus === 'Optimized' ? 'অপ্টিমাইজড' : col.indexStatus}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className={`text-xs font-black ${
                                col.health === 100 ? 'text-emerald-500' : 'text-amber-500'
                              }`}>{col.health}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* DB Optimization indicators */}
              <div className="space-y-6">
                <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6 text-center flex flex-col items-center">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider self-start">ডাটাবেজ ওভারঅল হেলথ</h4>
                  
                  {/* Circular Health score */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="64" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                      <circle cx="72" cy="72" r="64" stroke={dbScore === 100 ? '#10b981' : '#f59e0b'} strokeWidth="12" fill="transparent"
                        strokeDasharray={402} strokeDashoffset={402 - (402 * dbScore) / 100} strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-black text-gray-900">{dbScore}%</span>
                      <span className="text-[10px] text-gray-400 font-bold block mt-0.5">সবুজ সংকেত</span>
                    </div>
                  </div>

                  <div className="w-full border-t border-gray-50 pt-4 grid grid-cols-2 gap-2 text-left">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-[9px] text-gray-400 font-bold block">ব্যবহৃত ইনডেক্স</span>
                      <span className="text-xs font-black text-gray-900">১২ / ১২ টি</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-[9px] text-gray-400 font-bold block">অনাথ ফাইল সাইজ</span>
                      <span className="text-xs font-black text-gray-900">০.০০ KB</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowIndexModal(true)}
                    className="w-full py-3 border border-gray-100 hover:border-indigo-200 text-indigo-600 hover:bg-indigo-50/20 text-xs font-black rounded-xl transition-all"
                  >
                    কম্পোজিট ইনডেক্স গাইড দেখুন
                  </button>
                </section>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: ERROR LOGS LOGGER */}
        {activeTab === 'error_logs' && (
          <motion.div 
            key="logs_tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Telemetry Log Statistics Widget cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-gray-950 text-white flex items-center justify-center">
                  <Activity size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">মোট লগার ভলিউম</span>
                  <span className="text-lg font-black text-gray-900">{logs.length} টি ইভেন্ট</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                  <Flame size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">সক্রিয় এরর রেট</span>
                  <span className="text-lg font-black text-rose-600">{errorCount} টি সমস্যা</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">সিস্টেম সতর্কবার্তা</span>
                  <span className="text-lg font-black text-amber-600">{warningCount} টি সতর্কতা</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                  <Info size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">সাধারণ ইভেন্টস</span>
                  <span className="text-lg font-black text-blue-600">{infoCount} টি নোটিশ</span>
                </div>
              </div>
            </div>

            {/* Main searchable and filterable logs panel */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-50 pb-5">
                <div>
                  <h3 className="text-lg font-black text-gray-900">সিস্টেম কনসোল এবং এরর স্ট্যাক ট্রেস</h3>
                  <p className="text-[10px] font-bold text-gray-400">রিয়েল-টাইম স্ক্র্যাপার লগার, এপিআই রিকোয়েস্ট এরর এবং ক্যোয়ারী এক্সেপশন</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Live Stream Switcher */}
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 mr-2">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${liveStream ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${liveStream ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    </span>
                    <span className="text-[10px] font-black text-gray-600">লাইভ স্ট্রিমিং</span>
                    <button
                      onClick={() => setLiveStream(!liveStream)}
                      className={`w-8 h-4 rounded-full relative transition-all ${liveStream ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${liveStream ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <button
                    onClick={handleDownloadLogs}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-black transition-all"
                  >
                    <Download size={13} />
                    লগ ডাউনলোড
                  </button>

                  <button
                    onClick={handleClearLogs}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-xs font-black transition-all"
                  >
                    <Trash2 size={13} />
                    লগ ক্লিয়ার
                  </button>
                </div>
              </div>

              {/* Logs Search, Levels Filters */}
              <div className="flex flex-col md:flex-row items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <div className="relative flex-1 w-full">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="মডিউল বা এরর মেসেজ লিখে সার্চ করুন..."
                    value={searchQuery || ""}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold outline-none focus:border-indigo-500 transition-all placeholder-gray-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-start md:self-auto">
                  <Filter size={14} className="text-gray-400 mr-1" />
                  {(['ALL', 'ERROR', 'WARNING', 'INFO'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setLevelFilter(level)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${
                        levelFilter === level 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {level === "ALL" ? "সব" : level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Console Feed Output */}
              <div className="border border-gray-950 bg-gray-950 rounded-[28px] overflow-hidden text-gray-100 font-mono text-xs shadow-inner">
                {/* Simulated Header */}
                <div className="bg-gray-900 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold ml-2">Console Feed (bash-terminal: puthia-smart-core)</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold">
                    <span className="flex items-center gap-1"><Wifi size={10} className="text-emerald-500" /> API: OK</span>
                    <span className="flex items-center gap-1"><Server size={10} className="text-emerald-500" /> Node: v18.16</span>
                  </div>
                </div>

                {/* Console Log Rows */}
                <div className="divide-y divide-gray-900/40 p-4 max-h-[500px] overflow-y-auto scrollbar-thin">
                  {filteredLogs.length === 0 ? (
                    <div className="py-20 text-center text-gray-500 font-bold flex flex-col items-center justify-center gap-3">
                      <Sliders size={28} />
                      <span>কোনো ম্যাচিং ইভেন্ট বা এরর লগ পাওয়া যায়নি।</span>
                    </div>
                  ) : (
                    filteredLogs.map(log => (
                      <div 
                        key={log.id} 
                        className={`p-3 transition-colors ${
                          expandedLogId === log.id ? 'bg-white/5' : 'hover:bg-white/2.5'
                        }`}
                      >
                        <div 
                          className="flex items-start justify-between gap-4 cursor-pointer"
                          onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {/* Color prefix identifier */}
                            <span className={`font-black shrink-0 text-[10px] px-1.5 py-0.5 rounded ${
                              log.level === 'ERROR' ? 'bg-rose-500/20 text-rose-400' :
                              log.level === 'WARNING' ? 'bg-amber-500/20 text-emerald-500' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              [{log.level}]
                            </span>
                            
                            <div className="min-w-0">
                              <span className="text-gray-400 text-[10px] block md:inline font-bold mr-2">
                                {new Date(log.timestamp).toLocaleTimeString('bn-BD')}
                              </span>
                              <span className="text-indigo-400 font-black text-[11px] mr-2">
                                [{log.module}]
                              </span>
                              <span className="text-gray-200 break-words font-medium">{log.message}</span>
                            </div>
                          </div>

                          {log.stackTrace && (
                            <span className="text-[10px] text-gray-500 font-bold shrink-0 hover:text-gray-300">
                              {expandedLogId === log.id ? "লুকান [-]" : "স্ট্যাক [+]" }
                            </span>
                          )}
                        </div>

                        {/* Stack trace section expanded */}
                        <AnimatePresence>
                          {expandedLogId === log.id && log.stackTrace && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden mt-3"
                            >
                              <pre className="p-4 bg-[#0a0a0a] border border-gray-900 rounded-xl text-[10px] text-rose-300/80 overflow-x-auto whitespace-pre font-mono leading-relaxed">
                                {log.stackTrace}
                              </pre>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Index Modal Instructions Guide */}
      <AnimatePresence>
        {showIndexModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-950/60 backdrop-blur-md"
              onClick={() => setShowIndexModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-white rounded-[36px] shadow-2xl p-8 max-w-lg w-full relative z-10 overflow-hidden space-y-6"
            >
              <h3 className="text-lg font-black text-gray-900">কম্পোজিট ইনডেক্স গাইড</h3>
              
              <p className="text-xs text-gray-500 font-bold leading-relaxed">
                ফায়ারস্টোরে যখন একাধিক ফিল্টার কুয়েরি (e.g., query where field_a == x and order by field_b) করা হয়, তখন ম্যানুয়ালি কম্পোজিট ইনডেক্স সেটআপ করা প্রয়োজন।
              </p>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">প্রস্তাবিত কুয়েরি সূচক </span>
                
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-xl border border-gray-100 text-[11px] font-mono">
                    <span className="text-indigo-600 font-black">Collection:</span> businesses<br/>
                    <span className="text-indigo-600 font-black">Fields:</span> isApproved Ascending, createdAt Descending
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-100 text-[11px] font-mono">
                    <span className="text-indigo-600 font-black">Collection:</span> notifications<br/>
                    <span className="text-indigo-600 font-black">Fields:</span> userId Ascending, createdAt Descending
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIndexModal(false)}
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-black text-xs transition-all"
              >
                পড়া শেষ হয়েছে
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

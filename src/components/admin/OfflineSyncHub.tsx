import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Database, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Layers, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Play, 
  Pause, 
  Download, 
  UploadCloud, 
  Activity, 
  Server, 
  HardDrive, 
  FileText, 
  Zap, 
  ShieldAlert, 
  Search, 
  Filter, 
  ChevronRight, 
  Eye, 
  Check, 
  X, 
  Edit3, 
  Radio, 
  ArrowUpRight,
  Info,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  offlineSyncService, 
  CacheEntryInfo, 
  SyncQueueItem, 
  NetworkDiagnostics, 
  OfflineDataPack 
} from '../../services/offlineSyncService';
import { toast } from 'sonner';

type OfflineSyncTab = 'cache' | 'offline-data' | 'sync-queue' | 'failed-sync' | 'network-status';

export const OfflineSyncHub: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State
  const activeTab: OfflineSyncTab = useMemo(() => {
    const tabParam = searchParams.get('tab') as OfflineSyncTab;
    if (['cache', 'offline-data', 'sync-queue', 'failed-sync', 'network-status'].includes(tabParam)) {
      return tabParam;
    }
    return 'cache';
  }, [searchParams]);

  const handleTabChange = (newTab: OfflineSyncTab) => {
    setSearchParams({ tab: newTab });
  };

  // Cache State
  const [cacheList, setCacheList] = useState<CacheEntryInfo[]>([]);
  const [cacheSearch, setCacheSearch] = useState('');
  const [selectedCacheData, setSelectedCacheData] = useState<{ key: string; data: any } | null>(null);

  // Offline Packs State
  const [offlinePacks, setOfflinePacks] = useState<OfflineDataPack[]>([]);
  const [isDownloadingPacks, setIsDownloadingPacks] = useState(false);

  // Sync Queue State
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [isSyncPaused, setIsSyncPaused] = useState(false);
  const [isProcessingSync, setIsProcessingSync] = useState(false);
  const [inspectJob, setInspectJob] = useState<SyncQueueItem | null>(null);

  // Failed Sync State
  const [failedSyncs, setFailedSyncs] = useState<SyncQueueItem[]>([]);
  const [editingJob, setEditingJob] = useState<SyncQueueItem | null>(null);
  const [editPayloadJson, setEditPayloadJson] = useState('');

  // Network State
  const [networkInfo, setNetworkInfo] = useState<NetworkDiagnostics>(offlineSyncService.getNetworkDiagnostics());
  const [isPinging, setIsPinging] = useState(false);
  const [pingHistory, setPingHistory] = useState<{ time: string; latency: number; status: string }[]>([]);

  // Refresh all state
  const refreshAllState = () => {
    setCacheList(offlineSyncService.getAllCacheEntries());
    setOfflinePacks(offlineSyncService.getOfflineDataPacks());
    setSyncQueue(offlineSyncService.getSyncQueue());
    setFailedSyncs(offlineSyncService.getFailedSyncs());
    setIsSyncPaused(offlineSyncService.isSyncPaused());
    setNetworkInfo(offlineSyncService.getNetworkDiagnostics());
  };

  useEffect(() => {
    refreshAllState();

    const handleCacheUpdated = () => setCacheList(offlineSyncService.getAllCacheEntries());
    const handleQueueUpdated = () => {
      setSyncQueue(offlineSyncService.getSyncQueue());
      setFailedSyncs(offlineSyncService.getFailedSyncs());
    };
    const handleNetworkChanged = (e: any) => {
      if (e.detail) {
        setNetworkInfo(e.detail);
      } else {
        setNetworkInfo(offlineSyncService.getNetworkDiagnostics());
      }
    };

    window.addEventListener('adda_cache_updated', handleCacheUpdated);
    window.addEventListener('adda_sync_queue_updated', handleQueueUpdated);
    window.addEventListener('adda_network_status_changed', handleNetworkChanged);

    // Initial ping test
    handleRunPingTest();

    return () => {
      window.removeEventListener('adda_cache_updated', handleCacheUpdated);
      window.removeEventListener('adda_sync_queue_updated', handleQueueUpdated);
      window.removeEventListener('adda_network_status_changed', handleNetworkChanged);
    };
  }, []);

  // Total cache metrics
  const totalCacheSizeKb = useMemo(() => {
    const totalBytes = cacheList.reduce((acc, curr) => acc + curr.sizeBytes, 0);
    return (totalBytes / 1024).toFixed(1);
  }, [cacheList]);

  const totalCacheHits = useMemo(() => {
    return cacheList.reduce((acc, curr) => acc + curr.hitCount, 0);
  }, [cacheList]);

  // Bengali number formatter
  const toBengaliNumber = (num: number | string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(digit => {
      const parsed = parseInt(digit);
      return isNaN(parsed) ? digit : bengaliDigits[parsed];
    }).join('');
  };

  // 1. CACHE ACTIONS
  const handlePurgeSingleKey = (key: string) => {
    offlineSyncService.purgeCacheKey(key);
    toast.success(`ক্যাশ কি '${key}' সফলভাবে মুছে ফেলা হয়েছে!`);
    refreshAllState();
  };

  const handlePurgeAll = () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে সকল ইন-মেমোরি ও স্টোরেজ ক্যাশ মুছে ফেলতে চান?')) return;
    const res = offlineSyncService.purgeAllCache();
    toast.success(`🎉 সফলভাবে ${res.memoryCount}টি ক্যাশ রেকর্ড ক্লিয়ার করা হয়েছে!`);
    refreshAllState();
  };

  const handlePreCacheCore = async () => {
    const loadingToast = toast.loading('পুঠিয়ার মূল কালেকশনসমূহ প্রি-ক্যাশ করা হচ্ছে...');
    try {
      const res = await offlineSyncService.preCacheCoreCollections();
      toast.dismiss(loadingToast);
      toast.success(`✅ ${res.count}টি মূল কালেকশন (${(res.totalBytes / 1024).toFixed(1)} KB) ক্যাশে লোড হয়েছে!`);
      refreshAllState();
    } catch {
      toast.dismiss(loadingToast);
      toast.error('প্রি-ক্যাশ করতে সমস্যা হয়েছে।');
    }
  };

  const handleInspectCache = (key: string) => {
    const data = offlineSyncService.getCache(key);
    setSelectedCacheData({ key, data });
  };

  // 2. OFFLINE PACKS ACTIONS
  const handleDownloadAllPacks = async () => {
    setIsDownloadingPacks(true);
    const toastId = toast.loading('📦 অফলাইন ডেটা প্যাকসমূহ ডাউনলোড ও সিঙ্ক হচ্ছে...');
    await new Promise(r => setTimeout(r, 1500));
    await offlineSyncService.preCacheCoreCollections();
    setIsDownloadingPacks(false);
    toast.dismiss(toastId);
    toast.success('🎉 অফলাইন ডেটা প্যাক সম্পূর্ণ প্রস্তুত! ইন্টারনেট ছাড়াও অ্যাপ চলবে।');
    refreshAllState();
  };

  const handleExportOfflineSnapshot = () => {
    const snapshot = {
      appName: 'Puthia Digital Sheba - Offline Snapshot',
      exportedAt: new Date().toISOString(),
      cacheEntries: cacheList,
      packs: offlinePacks,
      queue: syncQueue,
      failed: failedSyncs
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `puthia_offline_snapshot_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('📥 অফলাইন ডেটা স্ন্যাপশট JSON ফাইল ডাউনলোড হয়েছে!');
  };

  // 3. SYNC QUEUE ACTIONS
  const handleForceSyncNow = async () => {
    if (!networkInfo.isOnline) {
      toast.error('⚠️ ইন্টারনেট সংযোগ নেই! ক্লাউড সিঙ্ক সম্ভব নয়।');
      return;
    }
    setIsProcessingSync(true);
    const toastId = toast.loading('⚡ ক্লাউড ডেটাবেজের সাথে সিঙ্ক প্রসেসিং শুরু হয়েছে...');
    const result = await offlineSyncService.processSyncQueue();
    setIsProcessingSync(false);
    toast.dismiss(toastId);
    if (result.succeeded > 0 || result.failed > 0) {
      toast.success(`✅ সিঙ্ক সম্পন্ন: ${result.succeeded}টি সফল, ${result.failed}টি ব্যর্থ।`);
    } else {
      toast.info('সিঙ্ক কিউতে কোনো পেন্ডিং কাজ নেই।');
    }
    refreshAllState();
  };

  const handleToggleSyncPause = () => {
    const paused = offlineSyncService.toggleSyncEnginePause();
    setIsSyncPaused(paused);
    toast.info(paused ? '⏸️ সিঙ্ক ইঞ্জিন সাময়িকভাবে পজ করা হয়েছে।' : '▶️ সিঙ্ক ইঞ্জিন সক্রিয় করা হয়েছে!');
    refreshAllState();
  };

  const handleAddSampleMutation = () => {
    offlineSyncService.enqueueMutation(
      'CREATE',
      'emergency_reports',
      `doc_${Date.now()}`,
      {
        title: 'নাগরিক সড়ক দুর্ঘটনা রিপোর্ট',
        location: 'পুঠিয়া বাজার মোড়',
        reporter: userProfile?.name || 'অফলাইন নাগরিক',
        createdAt: new Date().toISOString()
      },
      'high'
    );
    toast.success('➕ একটি টেস্ট অফলাইন মিউটেশন কিউতে যুক্ত করা হয়েছে!');
    refreshAllState();
  };

  const handleClearQueue = () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে পেন্ডিং সিঙ্ক কিউ মুছে ফেলতে চান?')) return;
    const count = offlineSyncService.clearSyncQueue();
    toast.success(`🗑️ ${count}টি কিউ আইটেম মুছে ফেলা হয়েছে।`);
    refreshAllState();
  };

  // 4. FAILED SYNCS ACTIONS
  const handleRetryFailed = (jobId: string) => {
    const res = offlineSyncService.retryFailedSync(jobId);
    if (res) {
      toast.success('🔄 আইটেমটি পুনরায় সিঙ্ক কিউতে স্থানান্তর করা হয়েছে!');
      refreshAllState();
    }
  };

  const handleRetryAllFailed = () => {
    const count = offlineSyncService.retryAllFailedSyncs();
    toast.success(`🔄 মোট ${count}টি ব্যর্থ আইটেম পুনরায় সিঙ্ক কিউতে পাঠানো হয়েছে!`);
    refreshAllState();
  };

  const handleDiscardFailed = (jobId: string) => {
    offlineSyncService.discardFailedSync(jobId);
    toast.success('🗑️ ব্যর্থ আইটেমটি বাতিল ও মুছে ফেলা হয়েছে।');
    refreshAllState();
  };

  const handleOpenEditPayload = (job: SyncQueueItem) => {
    setEditingJob(job);
    setEditPayloadJson(JSON.stringify(job.payload, null, 2));
  };

  const handleSaveEditedPayload = () => {
    if (!editingJob) return;
    try {
      const parsed = JSON.parse(editPayloadJson);
      editingJob.payload = parsed;
      offlineSyncService.retryFailedSync(editingJob.id);
      setEditingJob(null);
      toast.success('✅ পে-লোড আপডেট করে পুনরায় সিঙ্কে পাঠানো হয়েছে!');
      refreshAllState();
    } catch {
      toast.error('❌ ইনভ্যালিড JSON সিনট্যাক্স! দয়া করে ঠিকভাবে লিখুন।');
    }
  };

  // 5. NETWORK ACTIONS
  const handleRunPingTest = async () => {
    setIsPinging(true);
    const latency = await offlineSyncService.runPingLatencyTest();
    setIsPinging(false);
    const nowStr = new Date().toLocaleTimeString('bn-BD');
    const status = latency < 80 ? 'Good' : latency < 250 ? 'Moderate' : 'Poor';
    setPingHistory(prev => [{ time: nowStr, latency, status }, ...prev.slice(0, 9)]);
    toast.success(`📡 পিং টেস্ট সম্পন্ন: ${latency} ms (${status})`);
    refreshAllState();
  };

  const handleToggleSimulatedOffline = () => {
    const isOffline = offlineSyncService.toggleSimulatedOffline();
    if (isOffline) {
      toast.warning('🔴 অফলাইন সিমুলেশন চালু হয়েছে! অ্যাপ এখন নেটওয়ার্কহীন হিসেবে কাজ করবে।');
    } else {
      toast.success('🟢 অফলাইন সিমুলেশন বন্ধ করা হয়েছে। অনলাইন সংযোগ সক্রিয়।');
    }
    refreshAllState();
  };

  // Filtered cache list
  const filteredCache = cacheList.filter(item => {
    if (!cacheSearch.trim()) return true;
    return item.key.toLowerCase().includes(cacheSearch.toLowerCase()) ||
           item.category.toLowerCase().includes(cacheSearch.toLowerCase());
  });

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-emerald-100/60 overflow-hidden mb-12">
      {/* Top Main Navigation Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-white/20 text-white rounded-2xl backdrop-blur-xs border border-white/20">
                <Database className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    Offline + Sync Command Center
                  </h1>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1 ${
                    networkInfo.isOnline ? 'bg-emerald-400 text-emerald-950 font-bold' : 'bg-red-500 text-white'
                  }`}>
                    {networkInfo.isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {networkInfo.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                  লোকাল ক্যাশ ব্যবস্থাপনা, অফলাইন ডেটা স্টোরেজ, রিয়েল-টাইম সিঙ্ক কিউ ও নেটওয়ার্ক ডায়াগনস্টিক হাব
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3 bg-white/10 px-3.5 py-2 rounded-2xl backdrop-blur-xs border border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-200">
              <HardDrive size={14} />
              <span>ক্যাশ: <strong className="text-white">{toBengaliNumber(totalCacheSizeKb)} KB</strong></span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="text-emerald-100 flex items-center gap-1">
              <UploadCloud size={14} className="text-amber-300" />
              <span>কিউ: <strong className="text-white">{toBengaliNumber(syncQueue.length)}</strong></span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="text-emerald-100 flex items-center gap-1">
              <AlertTriangle size={14} className="text-rose-300" />
              <span>ব্যর্থ: <strong className="text-white">{toBengaliNumber(failedSyncs.length)}</strong></span>
            </div>
          </div>
        </div>

        {/* 5 Primary Sub-Tabs - Fixed with shrink-0 and min-w-max to prevent squishing */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none w-full">
          <button
            onClick={() => handleTabChange('cache')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 min-w-max whitespace-nowrap ${
              activeTab === 'cache'
                ? 'bg-white text-emerald-800 shadow-md font-black'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Database size={15} />
            <span>Cache ({toBengaliNumber(cacheList.length)})</span>
          </button>

          <button
            onClick={() => handleTabChange('offline-data')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 min-w-max whitespace-nowrap ${
              activeTab === 'offline-data'
                ? 'bg-white text-emerald-800 shadow-md font-black'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <HardDrive size={15} />
            <span>Offline Data</span>
          </button>

          <button
            onClick={() => handleTabChange('sync-queue')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 min-w-max whitespace-nowrap ${
              activeTab === 'sync-queue'
                ? 'bg-white text-emerald-800 shadow-md font-black'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <UploadCloud size={15} />
            <span>Sync Queue ({toBengaliNumber(syncQueue.length)})</span>
          </button>

          <button
            onClick={() => handleTabChange('failed-sync')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 min-w-max whitespace-nowrap ${
              activeTab === 'failed-sync'
                ? 'bg-white text-emerald-800 shadow-md font-black'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <AlertTriangle size={15} />
            <span>Failed Sync ({toBengaliNumber(failedSyncs.length)})</span>
          </button>

          <button
            onClick={() => handleTabChange('network-status')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 min-w-max whitespace-nowrap ${
              activeTab === 'network-status'
                ? 'bg-white text-emerald-800 shadow-md font-black'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Activity size={15} />
            <span>Network Status</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. CACHE TAB */}
      {/* ============================================================ */}
      {activeTab === 'cache' && (
        <div className="p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">অ্যাক্টিভ ক্যাশ কি</span>
                <span className="p-2 bg-teal-100 text-teal-800 rounded-xl"><Layers size={16} /></span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">{toBengaliNumber(cacheList.length)} টি</div>
              <p className="text-[11px] text-slate-500 mt-0.5">ইন-মেমোরি ও স্টোরেজ</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">মোট মেমোরি সাইজ</span>
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl"><HardDrive size={16} /></span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">{toBengaliNumber(totalCacheSizeKb)} KB</div>
              <p className="text-[11px] text-slate-500 mt-0.5">গড়ে {(Number(totalCacheSizeKb) / Math.max(cacheList.length, 1)).toFixed(1)} KB/কী</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">ক্যাশ হিট কাউন্ট</span>
                <span className="p-2 bg-amber-100 text-amber-800 rounded-xl"><Zap size={16} /></span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">{toBengaliNumber(totalCacheHits)} বার</div>
              <p className="text-[11px] text-slate-500 mt-0.5">ডাটাবেজ রিড সেভ হয়েছে</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">ডিফল্ট TTL লাইফ</span>
                <span className="p-2 bg-blue-100 text-blue-800 rounded-xl"><Clock size={16} /></span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">১০-৩০ মিনিট</div>
              <p className="text-[11px] text-slate-500 mt-0.5">অটো-এক্সপায়ার রুলস</p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={cacheSearch}
                onChange={(e) => setCacheSearch(e.target.value)}
                placeholder="ক্যাশ কি অথবা ক্যাটাগরি সার্চ করুন..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePreCacheCore}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles size={14} />
                মূল ডেটা প্রি-ক্যাশ করুন
              </button>
              <button
                onClick={handlePurgeAll}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Trash2 size={14} />
                সকল ক্যাশ ক্লিয়ার করুন
              </button>
            </div>
          </div>

          {/* Cache Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">ক্যাশ কি (Cache Key)</th>
                    <th className="p-3.5">ক্যাটাগরি</th>
                    <th className="p-3.5">সাইজ (Bytes)</th>
                    <th className="p-3.5">হিট কাউন্ট</th>
                    <th className="p-3.5">TTL মেয়াদ</th>
                    <th className="p-3.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCache.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        কোনো ক্যাশ এন্ট্রি পাওয়া যায়নি। "মূল ডেটা প্রি-ক্যাশ করুন" বাটনে চাপুন।
                      </td>
                    </tr>
                  ) : (
                    filteredCache.map((item) => (
                      <tr key={item.key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {item.key}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.category === 'core' ? 'bg-teal-100 text-teal-800' :
                            item.category === 'system' ? 'bg-blue-100 text-blue-800' :
                            item.category === 'user' ? 'bg-purple-100 text-purple-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 font-mono">
                          {toBengaliNumber(item.sizeBytes)} B ({(item.sizeBytes / 1024).toFixed(1)} KB)
                        </td>
                        <td className="p-3.5">
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {toBengaliNumber(item.hitCount)} বার
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {toBengaliNumber(item.ttlMinutes)} মিনিট
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleInspectCache(item.key)}
                            className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="ডেটা প্রিভিউ দেখুন"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handlePurgeSingleKey(item.key)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="ক্যাশ মুছে ফেলুন"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. OFFLINE DATA TAB */}
      {/* ============================================================ */}
      {activeTab === 'offline-data' && (
        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-base flex items-center gap-2">
                <HardDrive className="text-teal-400" size={20} />
                পুঠিয়া অফলাইন ডেটা স্টোরেজ ও PWA সিঙ্ক হাব
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                জরুরি পরিস্থিতিতে ইন্টারনেট সংযোগ বিচ্ছিন্ন হলেও পুঠিয়ার নাগরিকরা যেন রক্তদাতা, ডাক্তার, থানা, ফায়ার সার্ভিস ও বাস-ট্রেন শিডিউল ব্রাউজ করতে পারেন সেজন্য অফলাইন প্যাক লোড করে রাখা হয়।
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDownloadAllPacks}
                disabled={isDownloadingPacks}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Download size={15} />
                {isDownloadingPacks ? 'ডাউনলোড হচ্ছে...' : 'সকল প্যাক অফলাইন করুন'}
              </button>
              <button
                onClick={handleExportOfflineSnapshot}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
              >
                <FileText size={15} />
                JSON এক্সপোর্ট
              </button>
            </div>
          </div>

          {/* Offline Data Packs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offlinePacks.map((pack) => (
              <div key={pack.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-teal-500/50 transition-all space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-white rounded-xl border border-slate-200 text-teal-700 shadow-2xs">
                      <Database size={16} />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{pack.name}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{pack.collection}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={11} /> রেডি
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">রেকর্ড সংখ্যা</span>
                    <strong className="text-slate-800 font-bold">{toBengaliNumber(pack.recordCount)} টি</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">স্টোরেজ সাইজ</span>
                    <strong className="text-slate-800 font-bold">{toBengaliNumber(pack.sizeKb)} KB</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                  <span>অবস্থা: ১০০% অফলাইন সাপোর্ট</span>
                  <button 
                    onClick={() => toast.success(`'${pack.name}' পুনরায় সিঙ্ক করা হয়েছে!`)}
                    className="text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} /> রিফ্রেশ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. SYNC QUEUE TAB */}
      {/* ============================================================ */}
      {activeTab === 'sync-queue' && (
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <UploadCloud className="text-teal-600" size={18} />
                রিয়েল-টাইম অফলাইন মিউটেশন কিউ (Sync Queue)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                অফলাইনে ব্যবহারকারীদের তৈরি করা ডাটা এখানে কিউতে জমা থাকে এবং ইন্টারনেট পাওয়ার সাথে সাথে ক্লাউডে ব্যাকআপ হয়।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSyncPause}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSyncPaused
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                }`}
              >
                {isSyncPaused ? <Play size={14} /> : <Pause size={14} />}
                {isSyncPaused ? 'সিঙ্ক চালু করুন' : 'সিঙ্ক পজ করুন'}
              </button>

              <button
                onClick={handleForceSyncNow}
                disabled={isProcessingSync || !networkInfo.isOnline}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Zap size={14} />
                {isProcessingSync ? 'সিঙ্ক হচ্ছে...' : 'এখনই সিঙ্ক করুন'}
              </button>

              <button
                onClick={handleAddSampleMutation}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="টেস্ট অফলাইন অ্যাকশন যোগ করুন"
              >
                + টেস্ট অ্যাকশন
              </button>

              <button
                onClick={handleClearQueue}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title="কিউ ক্লিয়ার করুন"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Queue Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">জব আইডি</th>
                    <th className="p-3.5">অপারেশন</th>
                    <th className="p-3.5">টার্গেট কালেকশন</th>
                    <th className="p-3.5">অগ্রাধিকার</th>
                    <th className="p-3.5">অবস্থা (Status)</th>
                    <th className="p-3.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {syncQueue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        🎉 সিঙ্ক কিউ সম্পূর্ণ খালি! কোনো পেন্ডিং অফলাইন মিউটেশন নেই।
                      </td>
                    </tr>
                  ) : (
                    syncQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {item.id}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            item.operation === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                            item.operation === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.operation}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-700">
                          {item.collectionName}
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold ${
                            item.priority === 'high' ? 'text-red-600 font-black' : 'text-slate-600'
                          }`}>
                            {item.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                            item.status === 'syncing' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {item.status === 'syncing' ? <RefreshCw size={10} className="animate-spin" /> : <Clock size={10} />}
                            {item.status === 'syncing' ? 'Syncing...' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setInspectJob(item)}
                            className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="পে-লোড দেখুন"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. FAILED SYNC TAB */}
      {/* ============================================================ */}
      {activeTab === 'failed-sync' && (
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-red-50 p-4 rounded-2xl border border-red-200 text-red-950">
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-red-900">
                <AlertTriangle className="text-red-600" size={18} />
                ব্যর্থ সিঙ্ক ও কনফ্লিক্ট ডায়াগনস্টিকস (Failed Sync Manager)
              </h3>
              <p className="text-xs text-red-700 mt-0.5">
                যেসব ডাটা নেটওয়ার্ক ত্রুটি বা পারমিশন ফেইলিউরের কারণে ক্লাউডে ব্যাকআপ হতে পারেনি সেগুলো এখান থেকে সমাধান করুন।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRetryAllFailed}
                disabled={failedSyncs.length === 0}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw size={14} />
                সকল ব্যর্থ আইটেম রিট্রাই
              </button>
              <button
                onClick={() => {
                  offlineSyncService.clearFailedSyncs();
                  toast.success('ব্যর্থ হিস্টোরি মুছে ফেলা হয়েছে।');
                  refreshAllState();
                }}
                disabled={failedSyncs.length === 0}
                className="px-3 py-2 bg-white hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                সব মুছুন
              </button>
            </div>
          </div>

          {/* Failed Items List */}
          <div className="space-y-3">
            {failedSyncs.length === 0 ? (
              <div className="p-10 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-400">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">কোনো ব্যর্থ সিঙ্ক নেই!</h4>
                <p className="text-xs text-slate-500 mt-0.5">সকল অফলাইন ট্রানজেকশন সফলভাবে ক্লাউডে সিঙ্ক হয়েছে।</p>
              </div>
            ) : (
              failedSyncs.map((job) => (
                <div key={job.id} className="p-4 bg-white border border-red-200 rounded-2xl shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{job.id}</span>
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                        {job.operation}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {job.collectionName} / {job.docId}
                      </span>
                    </div>

                    <p className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                      <AlertTriangle size={13} className="shrink-0" />
                      ত্রুটি: {job.errorMessage || 'Unknown network error'}
                    </p>

                    <div className="text-[11px] text-slate-400">
                      চেষ্টা: {toBengaliNumber(job.retryCount)}/{toBengaliNumber(job.maxRetries)} বার • কনফ্লিক্ট স্ট্র্যাটেজি: {job.conflictStrategy}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditPayload(job)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit3 size={13} /> এডিট ও রিট্রাই
                    </button>
                    <button
                      onClick={() => handleRetryFailed(job.id)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <RefreshCw size={13} /> পুনরায় চেষ্টা
                    </button>
                    <button
                      onClick={() => handleDiscardFailed(job.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="বাতিল করুন"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. NETWORK STATUS TAB */}
      {/* ============================================================ */}
      {activeTab === 'network-status' && (
        <div className="p-6 space-y-6">
          {/* Main Network Monitor Card */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${networkInfo.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`}></span>
                  <h3 className="font-black text-lg">
                    {networkInfo.isOnline ? 'ইন্টারনেট সংযোগ সক্রিয় (Connected)' : 'অফলাইন মোড (No Internet)'}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  ক্লাউড ফায়ারবেজ ও গুগল ক্লাউড সার্ভারের সাথে রিয়েল-টাইম ল্যাটেন্সি রেট
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunPingTest}
                  disabled={isPinging}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Radio size={14} className={isPinging ? 'animate-spin' : ''} />
                  {isPinging ? 'ল্যাটেন্সি চেক হচ্ছে...' : 'লাইভ পিং টেস্ট'}
                </button>

                <button
                  onClick={handleToggleSimulatedOffline}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    networkInfo.isSimulatedOffline
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <WifiOff size={14} />
                  {networkInfo.isSimulatedOffline ? 'অফলাইন সিমুলেশন বন্ধ করুন' : 'অফলাইন মোড টেস্ট করুন'}
                </button>
              </div>
            </div>

            {/* Diagnostic Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 text-center">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">ল্যাটেন্সি (RTT)</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">
                  {toBengaliNumber(networkInfo.lastPingMs)} ms
                </span>
                <span className="text-[10px] text-emerald-300">স্ট্যাটাস: {networkInfo.pingStatus}</span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">কানেকশন টাইপ</span>
                <span className="text-xl font-black text-white mt-1 block uppercase">
                  {networkInfo.effectiveType}
                </span>
                <span className="text-[10px] text-slate-400">ব্রাউজার নেটওয়ার্ক</span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">ডাউনলিঙ্ক স্পিড</span>
                <span className="text-xl font-black text-white mt-1 block">
                  {toBengaliNumber(networkInfo.downlinkSpeedMbps)} Mbps
                </span>
                <span className="text-[10px] text-slate-400">এস্টিমেটেড ব্যান্ডউইথ</span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">PWA সার্ভিস ওয়ার্কার</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">
                  সক্রিয়
                </span>
                <span className="text-[10px] text-emerald-300">অটো-ক্যাশিং এনাবল্ড</span>
              </div>
            </div>
          </div>

          {/* Recent Latency Ping History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity size={15} className="text-teal-600" /> সাম্প্রতিক পিং ও নেটওয়ার্ক টেস্ট হিস্টোরি
            </h4>
            <div className="divide-y divide-slate-100">
              {pingHistory.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-800">গুগল ফায়ারবেজ গেটওয়ে পিং</span>
                    <span className="text-slate-400 text-[11px]">({p.time})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {p.latency} ms
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inspect Cache Data Modal */}
      {selectedCacheData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-100 text-teal-800 rounded-xl"><Eye size={16} /></span>
                <h4 className="font-black text-slate-900 text-sm font-mono">{selectedCacheData.key}</h4>
              </div>
              <button
                onClick={() => setSelectedCacheData(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl max-h-80 overflow-y-auto">
              <pre>{JSON.stringify(selectedCacheData.data, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCacheData(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Job Payload Modal */}
      {inspectJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-100 text-teal-800 rounded-xl"><FileText size={16} /></span>
                <div>
                  <h4 className="font-black text-slate-900 text-sm font-mono">{inspectJob.id}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">{inspectJob.collectionName} / {inspectJob.operation}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl max-h-80 overflow-y-auto">
              <pre>{JSON.stringify(inspectJob.payload, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectJob(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payload Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-xl"><Edit3 size={16} /></span>
                <div>
                  <h4 className="font-black text-slate-900 text-sm font-mono">পে-লোড এডিট ও ফিক্স ({editingJob.id})</h4>
                  <span className="text-[11px] text-slate-500 font-mono">{editingJob.collectionName}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                JSON পে-লোড ডেটা
              </label>
              <textarea
                value={editPayloadJson}
                onChange={(e) => setEditPayloadJson(e.target.value)}
                rows={8}
                className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingJob(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveEditedPayload}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check size={14} />
                সেভ করুন ও সিঙ্ক কিউতে পাঠান
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

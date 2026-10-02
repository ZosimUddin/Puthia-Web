import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  HardDrive, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  FileCheck, 
  Sparkles, 
  Layers, 
  Database,
  Film,
  Image as ImageIcon,
  Activity,
  Filter,
  Music,
  Disc3
} from 'lucide-react';
import { 
  mediaProcessingService, 
  MediaRecord, 
  StorageMetrics 
} from '../../services/mediaProcessingService';
import { AdminMusicManagerModal } from './music/AdminMusicManagerModal';

export const AdminMediaModerationHub: React.FC = () => {
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null);
  const [allMedia, setAllMedia] = useState<MediaRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'processing' | 'failed' | 'reported' | 'orphan'>('all');
  const [cleaningOrphans, setCleaningOrphans] = useState(false);
  const [cleanReport, setCleanReport] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaRecord | null>(null);
  const [isMusicManagerOpen, setIsMusicManagerOpen] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = () => {
    setMetrics(mediaProcessingService.getStorageMetrics());
    setAllMedia(mediaProcessingService.getUserMediaLibrary('admin', 'all'));
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '০ KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleCleanOrphans = async () => {
    setCleaningOrphans(true);
    const res = await mediaProcessingService.cleanupOrphanMedia();
    setCleaningOrphans(false);
    setCleanReport(`✅ ${res.cleanedCount}টি অব্যবহৃত ফাইল মুছে মোট ${formatBytes(res.freedBytes)} স্টোরেজ খালি করা হয়েছে।`);
    loadAdminData();
    setTimeout(() => setCleanReport(null), 5000);
  };

  const handleAdminDelete = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই মিডিয়া ফাইলটি সম্পূর্ণ ডিলিট করবেন?')) {
      await mediaProcessingService.deleteMedia(id, true);
      loadAdminData();
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const filteredMedia = allMedia.filter(m => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'reported') return m.isReported;
    if (statusFilter === 'orphan') return m.isOrphan;
    return m.status === statusFilter;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden space-y-6 p-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-lg">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
              <span>মিডিয়া প্রসেসিং ও স্টোরেজ সেন্ট্রাল কনসোল</span>
              <span className="text-xs bg-emerald-100 text-[#006a4e] px-2.5 py-0.5 rounded-full font-bold">
                Enterprise CDN
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-bold">
              সিস্টেমের সমস্ত মিডিয়া ফাইল মনিটরিং, অপ্টিমাইজেশন, রিপোর্ট রিভিউ এবং মডারেশন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMusicManagerOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer border-0"
          >
            <Disc3 size={14} className="animate-spin-slow" />
            <span>🎵 মিউজিক লাইব্রেরি কনসোল</span>
          </button>
          <button
            onClick={handleCleanOrphans}
            disabled={cleaningOrphans}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer border-0 disabled:opacity-50"
          >
            {cleaningOrphans ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
            <span>অব্যবহৃত (Orphan) ফাইল সাফ করুন</span>
          </button>
          <button
            onClick={loadAdminData}
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer border-0"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {cleanReport && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-black text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#006a4e]" />
          <span>{cleanReport}</span>
        </div>
      )}

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <span className="text-xs text-slate-400 font-bold block">মোট ব্যবহৃত স্টোরেজ</span>
            <span className="text-xl font-black text-slate-800">{formatBytes(metrics.totalBytes)}</span>
            <span className="text-[11px] text-slate-500 block mt-1">মোট {metrics.totalFiles}টি ফাইল</span>
          </div>

          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
            <span className="text-xs text-emerald-700 font-bold block">ছবি ও রিল ভ্যারিয়েন্টস</span>
            <span className="text-xl font-black text-[#006a4e]">{formatBytes(metrics.imageBytes)}</span>
            <span className="text-[11px] text-emerald-600 block mt-1">{metrics.imageCount}টি ইমেজ</span>
          </div>

          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
            <span className="text-xs text-blue-700 font-bold block">ভিডিও ও স্ট্রিমিং ফাইল</span>
            <span className="text-xl font-black text-blue-700">{formatBytes(metrics.videoBytes)}</span>
            <span className="text-[11px] text-blue-600 block mt-1">{metrics.videoCount}টি ভিডিও</span>
          </div>

          <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100">
            <span className="text-xs text-purple-700 font-bold block">ডুপ্লিকেট সাশ্রয় (Saved)</span>
            <span className="text-xl font-black text-purple-700">+{formatBytes(metrics.duplicateSavedBytes)}</span>
            <span className="text-[11px] text-purple-600 block mt-1">{metrics.orphanCount}টি অব্যবহৃত ফাইল</span>
          </div>
        </div>
      )}

      {/* Pipeline Status Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'সকল ফাইল' },
            { id: 'ready', label: '✅ প্রস্তুত (Ready)' },
            { id: 'processing', label: '⏳ প্রসেসিং' },
            { id: 'reported', label: '🚨 রিপোর্টকৃত' },
            { id: 'orphan', label: '⚠️ অব্যবহৃত (Orphan)' },
            { id: 'failed', label: '❌ ব্যর্থ আপলোড' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0 ${
                statusFilter === f.id 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-slate-500">
          দেখানো হচ্ছে: {filteredMedia.length}টি ফাইল
        </span>
      </div>

      {/* Media Management Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3">মিডিয়া প্রিভিউ</th>
                <th className="p-3">টার্গেট ও আপলোডার</th>
                <th className="p-3">সাইজ ও রেজোলিউশন</th>
                <th className="p-3">স্ট্যাটাস ও ভ্যারিয়েন্ট</th>
                <th className="p-3">নিরাপত্তা স্ক্যান</th>
                <th className="p-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedia.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 font-bold">
                    কোনো মিডিয়া ফাইল পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredMedia.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                          <img 
                            src={m.thumbnailUrl || m.originalUrl} 
                            alt={m.originalFileName} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="max-w-[140px] truncate">
                          <span className="font-black text-slate-800 block truncate" title={m.originalFileName}>
                            {m.originalFileName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{m.fileExtension}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="font-bold text-slate-700 block capitalize">{m.target.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{m.uploaderName || m.uploaderId}</span>
                    </td>

                    <td className="p-3">
                      <span className="font-black text-slate-800 block">{formatBytes(m.fileSizeBytes)}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{m.width}x{m.height}</span>
                    </td>

                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                        m.status === 'ready' ? 'bg-emerald-100 text-emerald-800' :
                        m.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {m.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                        {m.variants?.length || 1} ভ্যারিয়েন্টস
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 size={11} /> Clean & EXIF Stripped
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleAdminDelete(m.id)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-black text-[11px] transition cursor-pointer border border-rose-200"
                      >
                        ডিলিট
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Music Manager Modal */}
      {isMusicManagerOpen && (
        <AdminMusicManagerModal
          isOpen={isMusicManagerOpen}
          onClose={() => setIsMusicManagerOpen(false)}
        />
      )}
    </div>
  );
};

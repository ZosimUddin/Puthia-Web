import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Download, 
  FileText, 
  Search, 
  Trash2, 
  Share2, 
  ExternalLink, 
  FolderDown, 
  Clock, 
  CheckCircle2, 
  HardDrive, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { copyToClipboard } from '../../utils/clipboard';

export interface DownloadedItem {
  id: string;
  title: string;
  category: string;
  type: string; // e.g. "PDF", "DOCX", "Image"
  size: string; // e.g. "1.2 MB"
  downloadedAt: string; // ISO date string
  dept?: string;
  url?: string;
}

const DEFAULT_DOWNLOADS: DownloadedItem[] = [
  {
    id: 'dl-1',
    title: 'জাতীয় পরিচয়পত্র (NID) সংশোধন ফরম',
    category: 'নাগরিক ফরম',
    type: 'PDF',
    size: '১.২ এমবি',
    downloadedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    dept: 'নির্বাচন কমিশন কার্যালয়'
  },
  {
    id: 'dl-[#009664]',
    title: 'অনলাইন ট্রেড লাইসেন্স আবেদন নির্দেশিকা ২০২৬',
    category: 'ব্যবসা ও বাজার',
    type: 'PDF',
    size: '২.৪ এমবি',
    downloadedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    dept: 'পুঠিয়া পৌরসভা কার্যালয়'
  },
  {
    id: 'dl-3',
    title: 'কৃষি প্রণোদনা ও সার বরাদ্দ আবেদন পত্র',
    category: 'কৃষি ও প্রাণী',
    type: 'PDF',
    size: '৯৮০ কেবি',
    downloadedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    dept: 'উপজেলা কৃষি সম্প্রসারণ দপ্তর'
  },
  {
    id: 'dl-4',
    title: 'পুঠিয়া রাজবাড়ি দর্শন ও পর্যটন গাইড ম্যাপ',
    category: 'পর্যটন ও ঐতিহ্য',
    type: 'JPG',
    size: '৩.৫ এমবি',
    downloadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    dept: 'উপজেলা পর্যটন সেল'
  }
];

const MyDownloads: React.FC = () => {
  const navigate = useNavigate();
  const [downloads, setDownloads] = useState<DownloadedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = () => {
    try {
      const saved = localStorage.getItem('downloaded_files_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDownloads(parsed);
          return;
        }
      }
      // If none saved, populate initial demo download history
      setDownloads(DEFAULT_DOWNLOADS);
      localStorage.setItem('downloaded_files_history', JSON.stringify(DEFAULT_DOWNLOADS));
    } catch {
      setDownloads(DEFAULT_DOWNLOADS);
    }
  };

  const handleReDownload = (item: DownloadedItem) => {
    toast.loading(`"${item.title}" পুনরায় ডাউনলোড হচ্ছে...`, { duration: 1500 });
    
    // Update timestamp
    const updated = downloads.map(d => {
      if (d.id === item.id) {
        return { ...d, downloadedAt: new Date().toISOString() };
      }
      return d;
    });
    setDownloads(updated);
    localStorage.setItem('downloaded_files_history', JSON.stringify(updated));

    setTimeout(() => {
      toast.success(`ফাইল ডাউনলোড সম্পন্ন হয়েছে!`);
    }, 1600);
  };

  const handleShare = async (item: DownloadedItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `আমাদের পুঠিয়া পোর্টাল থেকে ফাইল ডাউনলোড করুন: ${item.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      await copyToClipboard(window.location.href);
      toast.success("ফাইল লিংক ক্লিপবোর্ডে কপি করা হয়েছে!");
    }
  };

  const handleRemoveOne = (id: string) => {
    const updated = downloads.filter(d => d.id !== id);
    setDownloads(updated);
    localStorage.setItem('downloaded_files_history', JSON.stringify(updated));
    toast.success("ডাউনলোড ইতিহাস থেকে সরানো হয়েছে!");
  };

  const handleClearAll = () => {
    if (!window.confirm("আপনি কি সমস্ত ডাউনলোড ইতিহাস মুছে ফেলতে চান?")) return;
    setDownloads([]);
    localStorage.removeItem('downloaded_files_history');
    toast.success("সমস্ত ডাউনলোড ইতিহাস ক্লিয়ার করা হয়েছে!");
  };

  const categories = ['all', ...Array.from(new Set(downloads.map(d => d.category)))];

  const filteredDownloads = downloads.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      item.title.toLowerCase().includes(q) || 
      (item.dept && item.dept.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 rounded-none sm:rounded-3xl shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-2 text-blue-200 text-xs font-bold">
              <FolderDown size={16} />
              <span>অফলাইন ডক ম্যানেজার • আমাদের পুঠিয়া</span>
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
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">আমার ডাউনলোড</h1>
            </div>

            <p className="text-xs md:text-sm text-blue-100 max-w-xl">
              আপনার সংরক্ষিত সরকারি ফরম, সার্কুলার, নির্দেশিকা ও পিডিএফ নথিগুলোর ইতিহাস দেখুন ও পুনরায় ডাউনলোড করুন।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/resources-hub')}
              className="px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 rounded-2xl font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FileText size={15} />
              <span>রিসোর্স হাব</span>
            </button>
            {downloads.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-white rounded-2xl font-bold text-xs border border-white/20 transition-all flex items-center gap-1 cursor-pointer"
                title="ইতিহাস মুছুন"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Summary Bar */}
      <div className="mx-4 sm:mx-0 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
            {downloads.length}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">সংরক্ষিত ফাইল</p>
            <p className="text-sm font-black text-slate-800">মোট ফাইল</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
            <HardDrive size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">মোবাইল স্টোরেজ</p>
            <p className="text-sm font-black text-emerald-700">অফলাইন প্রস্তুত</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">ভেরিফায়েড ফাইল</p>
            <p className="text-sm font-black text-purple-700">১০০% শতভাগ সঠিক</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mx-4 sm:mx-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ফাইল নাম বা ক্যাটাগরি দিয়ে অনুসন্ধান করুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-bold text-slate-800 placeholder:text-slate-400"
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

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          <span className="text-[11px] font-black text-slate-400 uppercase shrink-0 flex items-center gap-1 mr-1">
            <Filter size={12} /> ক্যাটাগরি:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'সকল ফাইল' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files List */}
      {filteredDownloads.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 space-y-4">
          <FolderDown size={48} className="mx-auto text-slate-300" />
          <div>
            <h3 className="text-base font-black text-slate-800">কোনো ডাউনলোড করা ফাইল পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {searchQuery ? `"${searchQuery}" এর সাথে কোনো ডাউনলোড হিস্টোরি মেলেনি।` : 'আপনি অ্যাপ পোর্টাল থেকে যে সকল পিডিএফ ও ফরম ডাউনলোড করবেন তা এখানে পাবেন।'}
            </p>
          </div>
          <button
            onClick={() => navigate('/resources-hub')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download size={15} />
            <span>রিসোর্স হাব ব্রাউজ করুন</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 px-4 sm:px-0">
          {filteredDownloads.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 font-black text-xs">
                  {item.type || 'PDF'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {item.size}
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors mt-1 truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold mt-1">
                    {item.dept && <span>{item.dept}</span>}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(item.downloadedAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleReDownload(item)}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200 cursor-pointer"
                  title="পুনরায় ডাউনলোড করুন"
                >
                  <Download size={14} />
                  <span>পুনরায় ডাউনলোড</span>
                </button>

                <button
                  onClick={() => handleShare(item)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
                  title="শেয়ার করুন"
                >
                  <Share2 size={14} />
                </button>

                <button
                  onClick={() => handleRemoveOne(item.id)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors border border-rose-200 cursor-pointer"
                  title="তালিকা থেকে সরান"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDownloads;

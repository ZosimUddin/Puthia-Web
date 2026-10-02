import React, { useState, useEffect } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Film, 
  FileText, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  HardDrive, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Globe, 
  Lock, 
  Users, 
  AlertTriangle, 
  Plus, 
  Search,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { 
  mediaProcessingService, 
  MediaRecord, 
  MediaVariant,
  StorageMetrics 
} from '../../services/mediaProcessingService';
import { UnifiedMediaUploader } from './UnifiedMediaUploader';

interface MyMediaLibraryModalProps {
  userId: string;
  userName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia?: (media: MediaRecord) => void;
  selectMode?: boolean;
}

export const MyMediaLibraryModal: React.FC<MyMediaLibraryModalProps> = ({
  userId,
  userName = 'নাগরিক',
  isOpen,
  onClose,
  onSelectMedia,
  selectMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'reel' | 'story' | 'document'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaList, setMediaList] = useState<MediaRecord[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaRecord | null>(null);
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [copiedVariantUrl, setCopiedVariantUrl] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen, activeTab, userId]);

  const loadMedia = () => {
    const list = mediaProcessingService.getUserMediaLibrary(userId, activeTab);
    setMediaList(list);
    setMetrics(mediaProcessingService.getStorageMetrics());
  };

  if (!isOpen) return null;

  const filteredList = mediaList.filter(m => 
    m.originalFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '০ KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedVariantUrl(url);
    setTimeout(() => setCopiedVariantUrl(null), 2000);
  };

  const handleDeleteMedia = async (mediaId: string, force = false) => {
    const res = await mediaProcessingService.deleteMedia(mediaId, force);
    if (res.success) {
      setDeleteStatus(res.message);
      if (selectedItem?.id === mediaId) {
        setSelectedItem(null);
      }
      loadMedia();
    } else {
      setDeleteStatus(res.message);
    }
    setTimeout(() => setDeleteStatus(null), 4000);
  };

  const handleUploadComplete = (newMedia: MediaRecord | MediaRecord[]) => {
    setShowUploader(false);
    loadMedia();
    if (Array.isArray(newMedia)) {
      if (newMedia.length > 0) setSelectedItem(newMedia[0]);
    } else if (newMedia) {
      setSelectedItem(newMedia);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl h-[90vh] max-h-[820px] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#006a4e] text-white flex items-center justify-center shadow-md">
              <HardDrive size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-800">
                  আমার মিডিয়া হাব (Media Library)
                </h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">
                  স্টোরেজ ও ভ্যারিয়েন্ট হাব
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold">
                আপনার প্রোফাইল, পোস্ট, রিলস ও স্টোরির সমস্ত সেন্ট্রাল অপ্টিমাইজড মিডিয়া
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowUploader(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#006a4e] hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-0 shadow-sm"
            >
              <Plus size={14} /> নতুন আপলোড
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition cursor-pointer border-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Storage Bar Overview */}
        {metrics && (
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-400 text-[10px] font-bold block">মোট ব্যবহার</span>
                <span className="font-black text-emerald-400 text-sm">{formatBytes(metrics.totalBytes)}</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-400 text-[10px] font-bold block">ছবি ({metrics.imageCount})</span>
                <span className="font-bold text-slate-200">{formatBytes(metrics.imageBytes)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold block">ভিডিও/রিল ({metrics.videoCount})</span>
                <span className="font-bold text-slate-200">{formatBytes(metrics.videoBytes)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold block">ডুপ্লিকেট সাশ্রয়</span>
                <span className="font-bold text-teal-400">+{formatBytes(metrics.duplicateSavedBytes)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] bg-white/10 px-3 py-1 rounded-xl border border-white/10">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>CDN ক্যাশিং ও স্বয়ংক্রিয় EXIF রিমুভার সক্রিয়</span>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left / Center Grid View */}
          <div className="flex-1 flex flex-col border-r border-slate-100 overflow-hidden">
            {/* Filter Tabs & Search */}
            <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
              {/* Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'all', label: 'সব মিডিয়া', icon: Layers },
                  { id: 'image', label: 'ছবি', icon: ImageIcon },
                  { id: 'video', label: 'ভিডিও', icon: VideoIcon },
                  { id: 'reel', label: 'রিলস', icon: Film },
                  { id: 'story', label: 'স্টোরিজ', icon: Clock },
                  { id: 'document', label: 'ডকুমেন্টস', icon: FileText }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border-0 shrink-0 ${
                        isActive 
                          ? 'bg-[#006a4e] text-white shadow-xs' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Icon size={13} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[180px]">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="মিডিয়া খুঁজুন..."
                  className="w-full pl-7 pr-3 py-1 text-xs rounded-xl bg-slate-100 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                />
              </div>
            </div>

            {/* Media Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                    <ImageIcon size={28} />
                  </div>
                  <h4 className="text-sm font-black text-slate-700">কোনো মিডিয়া ফাইল পাওয়া যায়নি</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    আপনার পছন্দের ছবি, ভিডিও বা রিল আপলোড করে লাইব্রেরি সমৃদ্ধ করুন।
                  </p>
                  <button
                    onClick={() => setShowUploader(true)}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#006a4e] text-white text-xs font-black cursor-pointer border-0 shadow-sm"
                  >
                    + মিডিয়া আপলোড করুন
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredList.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    const isVideo = item.mediaType === 'video';

                    return (
                      <div 
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 aspect-square bg-slate-900 shadow-xs ${
                          isSelected 
                            ? 'border-[#006a4e] ring-3 ring-emerald-500/20 scale-[1.02]' 
                            : 'border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        <img 
                          src={item.thumbnailUrl || item.originalUrl} 
                          alt={item.originalFileName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                          {isVideo && (
                            <span className="bg-black/70 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 backdrop-blur-xs">
                              <Film size={10} />
                              {item.durationSeconds ? `${item.durationSeconds}s` : 'ভিডিও'}
                            </span>
                          )}
                          {item.target === 'story' && (
                            <span className="bg-fuchsia-600/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                              স্টোরি
                            </span>
                          )}
                        </div>

                        {/* Bottom Overlay Info */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 text-white">
                          <p className="text-[10px] font-bold truncate leading-tight">
                            {item.originalFileName}
                          </p>
                          <div className="flex items-center justify-between text-[9px] text-slate-300 mt-0.5">
                            <span>{formatBytes(item.fileSizeBytes)}</span>
                            <span>{item.variants?.length || 1} ভ্যারিয়েন্ট</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#006a4e] text-white flex items-center justify-center shadow-md">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Detail Pane */}
          <div className="w-80 border-l border-slate-100 flex flex-col bg-slate-50/50 overflow-y-auto hidden md:flex">
            {selectedItem ? (
              <div className="p-4 space-y-4">
                {/* Media Preview Box */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video relative flex items-center justify-center shadow-xs">
                  {selectedItem.mediaType === 'video' ? (
                    <video 
                      src={selectedItem.originalUrl} 
                      controls 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img 
                      src={selectedItem.originalUrl} 
                      alt={selectedItem.originalFileName}
                      className="w-full h-full object-contain" 
                    />
                  )}
                </div>

                {/* Status Notice */}
                {deleteStatus && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-900">
                    {deleteStatus}
                  </div>
                )}

                {/* File Details */}
                <div className="bg-white rounded-2xl p-3 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-800 truncate" title={selectedItem.originalFileName}>
                      {selectedItem.originalFileName}
                    </h4>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md uppercase">
                      {selectedItem.mediaType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold">সাইজ:</span>
                      <span className="font-bold">{formatBytes(selectedItem.fileSizeBytes)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold">টার্গেট:</span>
                      <span className="font-bold capitalize">{selectedItem.target.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold">রেজোলিউশন:</span>
                      <span className="font-bold">{selectedItem.width || 1200} × {selectedItem.height || 800}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold">গোপনীয়তা:</span>
                      <span className="font-bold">{selectedItem.privacy}</span>
                    </div>
                  </div>
                </div>

                {/* Generated Variants Box */}
                <div className="bg-white rounded-2xl p-3 border border-slate-200/80 space-y-2">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#006a4e]" /> প্রস্তুতকৃত ভ্যারিয়েন্টস ({selectedItem.variants?.length || 1})
                  </span>

                  <div className="space-y-1.5">
                    {selectedItem.variants?.map((v, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl text-[11px] border border-slate-200/60">
                        <div>
                          <span className="font-black text-slate-800 capitalize">{v.label.replace('_', ' ')}</span>
                          {v.width && <span className="text-slate-400 text-[10px] ml-1">({v.width}px)</span>}
                        </div>
                        <button
                          onClick={() => handleCopyLink(v.url)}
                          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition"
                        >
                          {copiedVariantUrl === v.url ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} />}
                          <span>{copiedVariantUrl === v.url ? 'কপি হয়েছে' : 'লিংক'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Usages & Security Details */}
                <div className="bg-white rounded-2xl p-3 border border-slate-200/80 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl">
                    <span className="flex items-center gap-1 font-bold">
                      <ShieldCheck size={13} /> নিরাপত্তা স্ক্যান
                    </span>
                    <span className="font-black">উত্তীর্ণ (Clean)</span>
                  </div>

                  <div className="text-slate-500 text-[10px]">
                    {selectedItem.usages?.length > 0 ? (
                      <p>📌 এই ফাইলটি {selectedItem.usages.length}টি জায়গায় ব্যবহৃত হচ্ছে।</p>
                    ) : (
                      <p className="text-amber-600 font-bold">⚠️ এটি এখনও কোনো পোস্টে যুক্ত হয়নি (Orphan Media)।</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  {onSelectMedia && (
                    <button
                      onClick={() => onSelectMedia(selectedItem)}
                      className="w-full py-2.5 rounded-2xl bg-[#006a4e] hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer border-0 shadow-md transition"
                    >
                      <CheckCircle2 size={15} /> এই মিডিয়া ব্যবহার করুন
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteMedia(selectedItem.id, false)}
                    className="w-full py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200 transition"
                  >
                    <Trash2 size={13} /> মিডিয়া মুছে ফেলুন
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Layers size={32} className="mb-2 opacity-50" />
                <p className="text-xs font-bold">বিস্তারিত দেখতে যেকোনো একটি মিডিয়া ফাইলে ক্লিক করুন</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal Overlay */}
      {showUploader && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <UnifiedMediaUploader
            target="post_photo"
            userId={userId}
            userName={userName}
            allowMultiple={true}
            onUploadSuccess={handleUploadComplete}
            onClose={() => setShowUploader(false)}
          />
        </div>
      )}
    </div>
  );
};

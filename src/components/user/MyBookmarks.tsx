import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bookmark, 
  Heart, 
  FileText, 
  PhoneCall, 
  Phone, 
  MapPin, 
  Newspaper, 
  Search, 
  Trash2, 
  Share2, 
  Download, 
  ExternalLink, 
  Filter, 
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { emergencyServicesList } from '../../pages/modules/EmergencyServicesData';
import { toast } from 'sonner';

export interface BookmarkItem {
  id: string;
  title: string;
  type: 'doc' | 'emergency' | 'notice' | 'place' | 'business';
  subtitle?: string;
  phone?: string;
  path?: string;
  dateSaved: string;
}

const MyBookmarks: React.FC = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = () => {
    const list: BookmarkItem[] = [];

    // 1. Load Fav Docs from localStorage
    try {
      const favDocsRaw = localStorage.getItem('fav_hub_docs');
      if (favDocsRaw) {
        const favDocs: string[] = JSON.parse(favDocsRaw);
        favDocs.forEach((docTitle, idx) => {
          list.push({
            id: `doc-${idx}`,
            title: docTitle,
            type: 'doc',
            subtitle: 'পুঠিয়া ডিজিটালাইজড ই-ফরম রিসোর্স',
            dateSaved: new Date().toISOString()
          });
        });
      }
    } catch {}

    // 2. Load Emergency Favorites
    try {
      const emFavsRaw = localStorage.getItem('emergency_favorites');
      if (emFavsRaw) {
        const emIds: string[] = JSON.parse(emFavsRaw);
        emergencyServicesList.filter(e => emIds.includes(e.id)).forEach(e => {
          list.push({
            id: `em-${e.id}`,
            title: e.name,
            type: 'emergency',
            subtitle: e.subtitle,
            phone: e.phone,
            dateSaved: new Date().toISOString()
          });
        });
      }
    } catch {}

    // 3. Fallback demo items if list is empty
    if (list.length === 0) {
      const defaultBookmarks: BookmarkItem[] = [
        {
          id: 'doc-demo-1',
          title: 'নাগরিকত্ব ও চারিত্রিক সনদপত্র ফরম',
          type: 'doc',
          subtitle: 'ইউনিয়ন পরিষদ সেবা ফরম',
          dateSaved: new Date().toISOString()
        },
        {
          id: 'em-demo-2',
          title: 'পুঠিয়া থানা হটলাইন (২৪/৭)',
          type: 'emergency',
          subtitle: 'জরুরি সেবা',
          phone: '01713-373685',
          dateSaved: new Date().toISOString()
        },
        {
          id: 'place-demo-3',
          title: 'পাঁচ আনী রাজবাড়ি ও শিব মন্দির',
          type: 'place',
          subtitle: 'পুঠিয়া রাজবাড়ি কম্পাউন্ড',
          path: '/important-places',
          dateSaved: new Date().toISOString()
        }
      ];
      setBookmarks(defaultBookmarks);
    } else {
      setBookmarks(list);
    }
  };

  const handleRemoveBookmark = (item: BookmarkItem) => {
    if (item.type === 'doc') {
      try {
        const favDocsRaw = localStorage.getItem('fav_hub_docs');
        if (favDocsRaw) {
          const favDocs: string[] = JSON.parse(favDocsRaw);
          const updated = favDocs.filter(t => t !== item.title);
          localStorage.setItem('fav_hub_docs', JSON.stringify(updated));
        }
      } catch {}
    } else if (item.type === 'emergency') {
      try {
        const emFavsRaw = localStorage.getItem('emergency_favorites');
        if (emFavsRaw) {
          const emIds: string[] = JSON.parse(emFavsRaw);
          const cleanId = item.id.replace('em-', '');
          const updated = emIds.filter(id => id !== cleanId);
          localStorage.setItem('emergency_favorites', JSON.stringify(updated));
        }
      } catch {}
    }

    setBookmarks(prev => prev.filter(b => b.id !== item.id));
    toast.success(`"${item.title}" বুকমার্ক তালিকা থেকে সরানো হয়েছে!`);
  };

  const handleDownload = (title: string) => {
    toast.loading(`"${title}" ডাউনলোড হচ্ছে...`, { duration: 1500 });
    setTimeout(() => {
      toast.success("ডাউনলোড সফলভাবে সম্পন্ন হয়েছে!");
    }, 1600);
  };

  const filteredBookmarks = bookmarks.filter(b => {
    const matchesType = selectedType === 'all' || b.type === selectedType;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      b.title.toLowerCase().includes(q) || 
      (b.subtitle && b.subtitle.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'doc':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ডকুমেন্ট / ফরম</span>;
      case 'emergency':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">জরুরি হটলাইন</span>;
      case 'place':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">দর্শনীয় স্থান</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">বুকমার্ক</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-800 text-white p-6 rounded-none sm:rounded-3xl shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-2 text-rose-200 text-xs font-bold">
              <Bookmark size={16} />
              <span>আমার সংরক্ষিত আইটেম • পুঠিয়া বুকমার্ক</span>
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
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">আমার বুকমার্ক</h1>
            </div>

            <p className="text-xs md:text-sm text-rose-100 max-w-xl">
              আপনার পছন্দের সকল ই-ফরম, জরুরি হটলাইন নম্বর, নোটিশ ও দর্শনীয় স্থানগুলো এক ক্লিপবোর্ডে দ্রুত খুঁজে পান।
            </p>
          </div>

          <button
            onClick={() => navigate('/resources-hub')}
            className="px-4 py-2.5 bg-white text-rose-700 hover:bg-rose-50 rounded-2xl font-black text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
          >
            <Sparkles size={15} />
            <span>আরও বুকমার্ক যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mx-4 sm:mx-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="বুকমার্কের নাম দিয়ে অনুসন্ধান করুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-xs font-bold text-slate-800 placeholder:text-slate-400"
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

        {/* Type Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          <span className="text-[11px] font-black text-slate-400 uppercase shrink-0 flex items-center gap-1 mr-1">
            <Filter size={12} /> টাইপ:
          </span>
          {[
            { key: 'all', label: 'সকল বুকমার্ক' },
            { key: 'doc', label: 'ফরম ও নথি' },
            { key: 'emergency', label: 'জরুরি নম্বর' },
            { key: 'place', label: 'দর্শনীয় স্থান' }
          ].map(type => (
            <button
              key={type.key}
              onClick={() => setSelectedType(type.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedType === type.key
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks List */}
      {filteredBookmarks.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 space-y-4">
          <Bookmark size={48} className="mx-auto text-slate-300" />
          <div>
            <h3 className="text-base font-black text-slate-800">কোনো বুকমার্ক পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              যেকোনো প্রয়োজনীয় ফরম বা ফোন নম্বরের পাশে বুকমার্ক (🔖) আইকনে ক্লিক করে সংরক্ষণ করুন।
            </p>
          </div>
          <button
            onClick={() => navigate('/resources-hub')}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Sparkles size={15} />
            <span>রিসোর্স ব্রাউজ করুন</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 sm:px-0">
          {filteredBookmarks.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-rose-300 hover:shadow-md transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold border ${
                  item.type === 'emergency' ? 'bg-red-50 text-red-600 border-red-100' :
                  item.type === 'doc' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {item.type === 'emergency' ? <PhoneCall size={18} /> : item.type === 'doc' ? <FileText size={18} /> : <MapPin size={18} />}
                </div>

                <div className="min-w-0">
                  <div className="mb-0.5">{getTypeBadge(item.type)}</div>
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-rose-600 transition-colors truncate">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-[11px] font-bold text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {item.type === 'emergency' && item.phone && (
                  <a
                    href={`tel:${item.phone}`}
                    className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1"
                  >
                    <Phone size={13} />
                    <span>কল</span>
                  </a>
                )}

                {item.type === 'doc' && (
                  <button
                    onClick={() => handleDownload(item.title)}
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors border border-emerald-200 cursor-pointer"
                    title="ডাউনলোড করুন"
                  >
                    <Download size={14} />
                  </button>
                )}

                {item.path && (
                  <button
                    onClick={() => navigate(item.path!)}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors border border-amber-200 cursor-pointer"
                    title="বিস্তারিত দেখুন"
                  >
                    <ExternalLink size={14} />
                  </button>
                )}

                <button
                  onClick={() => handleRemoveBookmark(item)}
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors border border-rose-200 cursor-pointer"
                  title="বুকমার্ক সরান"
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

export default MyBookmarks;

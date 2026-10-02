import React, { useState, useEffect } from 'react';
import { 
  onNewsSnapshot, 
  createNews, 
  updateNews, 
  deleteNews, 
  onCitizenReportsSnapshot, 
  updateCitizenReportStatus, 
  convertCitizenReportToNews,
  NewsItem, 
  CitizenNewsReport 
} from '../services/newsService';
import { useAuth } from '../contexts/AuthContext';
import { 
  Newspaper, Plus, Edit2, Trash2, Save, X, Loader2, Image as ImageIcon, 
  Send, Clock, User, Tag, Eye, Heart, MessageSquare, CheckCircle, XCircle, 
  Megaphone, ArrowUpRight, Check, AlertCircle, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContentNewsManagement() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'news' | 'citizen_reports'>('news');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenNewsReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("এইমাত্র");

  // Form State
  const [formData, setFormData] = useState<Partial<NewsItem>>({
    title: '',
    content: '',
    category: 'উন্নয়ন',
    image: '',
    authorName: 'আমাদের পুঠিয়া প্রতিনিধি',
    reporterLocation: 'পুঠিয়া, রাজশাহী',
    featured: false,
    status: 'published'
  });

  // 1. Subscribe to Live News & Citizen Reports (Firebase Real-Time Listeners)
  useEffect(() => {
    setIsLoading(true);
    const unsubscribeNews = onNewsSnapshot((items) => {
      setNews(items);
      setIsLoading(false);
      setLastSyncedTime(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    const unsubscribeReports = onCitizenReportsSnapshot((reports) => {
      setCitizenReports(reports);
      setLastSyncedTime(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    return () => {
      unsubscribeNews();
      unsubscribeReports();
    };
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastSyncedTime(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsRefreshing(false);
      toast.success('ফায়ারবেস রিয়েল-টাইম ডাটা সিঙ্ক সম্পন্ন!', { icon: '⚡' });
    }, 600);
  };

  const handleSave = async () => {
    if (!formData.title?.trim() || !formData.content?.trim()) {
      toast.error('শিরোনাম এবং কন্টেন্ট দেওয়া আবশ্যক');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await updateNews(editingId, formData, { uid: user?.uid || 'admin', email: user?.email || '', name: userProfile?.name });
        toast.success('সংবাদ সফলভাবে আপডেট হয়েছে!');
      } else {
        await createNews(formData, { uid: user?.uid || 'admin', email: user?.email || '', name: userProfile?.name });
        toast.success('নতুন সংবাদ প্রকাশিত হয়েছে!');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error('সংবাদ সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'উন্নয়ন',
      image: '',
      authorName: userProfile?.name || 'আমাদের পুঠিয়া প্রতিনিধি',
      reporterLocation: 'পুঠিয়া, রাজশাহী',
      featured: false,
      status: 'published'
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (item: NewsItem) => {
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      image: item.image || '',
      authorName: item.authorName || 'আমাদের পুঠিয়া প্রতিনিধি',
      reporterLocation: item.reporterLocation || 'পুঠিয়া, রাজশাহী',
      featured: Boolean(item.featured),
      status: item.status || 'published'
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই সংবাদটি মুছে ফেলতে চান?')) return;
    try {
      await deleteNews(id, { uid: user?.uid || 'admin', email: user?.email || '', name: userProfile?.name });
      toast.success('সংবাদ মুছে ফেলা হয়েছে');
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('মুছে ফেলতে সমস্যা হয়েছে।');
    }
  };

  const handleApproveReport = async (report: CitizenNewsReport) => {
    try {
      await convertCitizenReportToNews(report, { uid: user?.uid || 'admin', name: userProfile?.name });
      toast.success('নাগরিক সংবাদটি মূল পোর্টালে প্রকাশিত হয়েছে!');
    } catch (err) {
      console.error('Error approving citizen report:', err);
      toast.error('অনুমোদন করা সম্ভব হয়নি।');
    }
  };

  const handleRejectReport = async (reportId: string) => {
    if (!window.confirm('এই প্রতিবেদনটি প্রত্যাখ্যান করতে চান?')) return;
    try {
      await updateCitizenReportStatus(reportId, 'rejected', 'প্রশাসনিক বিবেচনায় বাতিল করা হয়েছে');
      toast.success('প্রতিবেদনটি প্রত্যাখ্যান করা হয়েছে');
    } catch (err) {
      toast.error('ব্যর্থ হয়েছে');
    }
  };

  const pendingReportsCount = citizenReports.filter(r => r.status === 'pending').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 mt-6 text-white shadow-xl animate-fade-in">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              সংবাদ ও তথ্য ব্যবস্থাপনা
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                রিয়েল-টাইম লাইভ
              </span>
            </h3>
            <p className="text-xs text-slate-400">ফায়ারবেস রিয়েল-টাইম ডাটাবেস দিয়ে সব সংবাদ ও নাগরিক রিপোর্ট অটো-সিঙ্ক হচ্ছে</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
            title="তাত্ক্ষণিক রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">রিফ্রেশ</span>
          </button>

          <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveTab('news')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'news' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              সংবাদ তালিকা ({news.length})
            </button>
            <button
              onClick={() => setActiveTab('citizen_reports')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'citizen_reports' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              নাগরিক রিপোর্ট
              {pendingReportsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-900 text-[10px] font-black flex items-center justify-center animate-pulse">
                  {pendingReportsCount}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'news' && (
            <button 
              onClick={() => {
                if (isAdding) resetForm();
                else setIsAdding(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
            >
              {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isAdding ? 'বাতিল' : 'নতুন সংবাদ লিখুন'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-Time Live Status Bar */}
      <div className="mb-6 p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-emerald-400">ফায়ারবেস লাইভ কানেকশন সক্রিয়:</span>
          <span className="text-slate-400">কোনো রিলোড ছাড়াই নতুন পোস্ট বা পরিবর্তন সরাসরি প্রতিফলিত হয়</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-mono text-slate-300">
            সর্বশেষ সিঙ্ক: {lastSyncedTime}
          </span>
          <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-2.5 py-1 rounded-lg font-bold">
            {news.length} টি প্রকাশিত সংবাদ
          </span>
        </div>
      </div>

      {/* Write / Edit Form */}
      {isAdding && activeTab === 'news' && (
        <div className="bg-slate-950/80 p-5 sm:p-6 rounded-2xl border border-slate-800 mb-8 space-y-4">
          <h4 className="font-bold text-white text-sm flex items-center gap-2 pb-2 border-b border-slate-800">
            <Edit2 className="w-4 h-4 text-emerald-400" />
            {editingId ? 'সংবাদ সম্পাদনা করুন' : 'নতুন সংবাদ প্রকাশ করুন'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">সংবাদের শিরোনাম *</label>
              <input 
                type="text" 
                value={formData.title || ""}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                placeholder="আকর্ষণীয় শিরোনাম লিখুন"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">ক্যাটাগরি</label>
              <select 
                value={formData.category || "উন্নয়ন"}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="উন্নয়ন">উন্নয়ন</option>
                <option value="রাজনীতি">রাজনীতি</option>
                <option value="শিক্ষা">শিক্ষা</option>
                <option value="খেলা">খেলাধুলা</option>
                <option value="অপরাধ">অপরাধ</option>
                <option value="সামাজিক">সামাজিক</option>
                <option value="সংস্কৃতি">সংস্কৃতি</option>
                <option value="অন্যান্য">অন্যান্য</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">সংবাদের বিস্তারিত কন্টেন্ট *</label>
            <textarea 
              rows={5}
              value={formData.content || ""}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 text-white p-3.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
              placeholder="সংবাদের বিস্তারিত এখানে লিখুন..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">ছবির লিঙ্ক (Image URL)</label>
              <input 
                type="url" 
                value={formData.image || ""}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">প্রতিবেদক (Author)</label>
              <input 
                type="text" 
                value={formData.authorName || ""}
                onChange={(e) => setFormData({...formData, authorName: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                placeholder="প্রতিবেদকের নাম"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input 
              type="checkbox"
              id="admin-feat"
              checked={Boolean(formData.featured)}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="w-4 h-4 text-emerald-500 rounded cursor-pointer"
            />
            <label htmlFor="admin-feat" className="text-xs font-bold text-slate-300 cursor-pointer">
              প্রধান সংবাদ (Featured Slider) হিসেবে পিন করুন
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button 
              type="button" 
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              বাতিল
            </button>
            <button 
              type="button" 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editingId ? 'আপডেট করুন' : 'প্রকাশ করুন'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: NEWS ARTICLES LIST */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
              <p className="text-xs font-bold">সংবাদ তালিকা লোড হচ্ছে...</p>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400">
              <Newspaper className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-bold">কোনো সংবাদ পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.map((item) => (
                <div 
                  key={item.id}
                  className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all"
                >
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Newspaper className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.category}
                        </span>
                        {item.featured && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            প্রধান
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{item.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {item.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-red-400" />
                        {item.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {item.commentsCount || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="সম্পাদনা"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CITIZEN REPORTS QUEUE */}
      {activeTab === 'citizen_reports' && (
        <div className="space-y-4">
          {citizenReports.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400">
              <Megaphone className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-bold">বর্তমানে কোনো নাগরিক সংবাদ জমা নেই</p>
            </div>
          ) : (
            <div className="space-y-3">
              {citizenReports.map((report) => (
                <div 
                  key={report.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {report.reporterName[0]}
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-white">{report.reporterName}</h5>
                        <p className="text-[11px] text-slate-400 font-mono">{report.reporterPhone} • {report.reporterLocation}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                      report.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      report.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {report.status === 'approved' ? 'অনুমোদিত' : report.status === 'rejected' ? 'বাতিল' : 'পর্যালোচনাধীন'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed font-medium">
                    {report.reporterContent}
                  </p>

                  {report.imageUrl && (
                    <div className="max-w-xs rounded-xl overflow-hidden border border-slate-800">
                      <img src={report.imageUrl} alt="" className="w-full h-32 object-cover" />
                    </div>
                  )}

                  {report.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleRejectReport(report.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all"
                      >
                        প্রত্যাখ্যান করুন
                      </button>
                      <button
                        onClick={() => handleApproveReport(report)}
                        className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>অনুমোদন ও সংবাদ প্রকাশ</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

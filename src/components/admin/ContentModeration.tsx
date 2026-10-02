import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  MessageSquare, 
  Store, 
  Flag, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ChevronRight,
  User,
  Clock,
  ExternalLink,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getModerationCounts, 
  getPendingUserPosts, 
  getPendingBusinesses, 
  getPendingReports, 
  getPendingComplaints,
  updateModerationStatus
} from "../../api";
import { UserPost, Business, Report, Complaint } from "../../types";

type ModerationTab = 'posts' | 'businesses' | 'reports' | 'complaints';

const ContentModeration = () => {
  const [activeTab, setActiveTab] = useState<ModerationTab>('posts');
  const [counts, setCounts] = useState({ posts: 0, businesses: 0, reports: 0, complaints: 0 });
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchCounts = async () => {
    const data = await getModerationCounts();
    setCounts(data);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      let data: any[] = [];
      if (activeTab === 'posts') data = await getPendingUserPosts();
      else if (activeTab === 'businesses') data = await getPendingBusinesses();
      else if (activeTab === 'reports') data = await getPendingReports();
      else if (activeTab === 'complaints') data = await getPendingComplaints();
      setItems(data);
    } catch (error) {
      console.error("Error fetching moderation items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: string) => {
    setProcessingId(id);
    try {
      const collectionName = 
        activeTab === 'posts' ? 'user_posts' : 
        activeTab === 'businesses' ? 'businesses' : 
        activeTab === 'reports' ? 'reports' : 
        'complaints';
      
      await updateModerationStatus(collectionName, id, status);
      setItems(prev => prev.filter(item => item.id !== id));
      fetchCounts();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const toBanglaNumber = (n: number) => {
    return n.toLocaleString('bn-BD');
  };

  const tabs = [
    { id: 'posts', label: 'নতুন পোস্ট', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50', count: counts.posts },
    { id: 'businesses', label: 'নতুন ব্যবসা', icon: Store, color: 'text-emerald-500', bg: 'bg-emerald-50', count: counts.businesses },
    { id: 'reports', label: 'রিভিউ রিপোর্ট', icon: Flag, color: 'text-amber-500', bg: 'bg-amber-50', count: counts.reports },
    { id: 'complaints', label: 'অভিযোগ', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50', count: counts.complaints },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-1">কন্টেন্ট মডারেশন সেকশন</h2>
        <p className="text-xs font-bold text-gray-400">নতুন কন্টেন্ট এবং রিপোর্টগুলো এখান থেকে ম্যানেজ করুন</p>
      </div>

      {/* Tabs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ModerationTab)}
            className={`relative flex items-center gap-4 p-5 rounded-[32px] border transition-all text-left ${
              activeTab === tab.id 
                ? "bg-white border-gray-900 shadow-xl scale-[1.02] z-10" 
                : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tab.bg} ${tab.color}`}>
              <tab.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{tab.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-gray-900">Pending</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${tab.count > 0 ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {toBanglaNumber(tab.count)}
                </span>
              </div>
            </div>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-900 rounded-full" 
              />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold">লোড হচ্ছে...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-gray-400 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={40} className="text-gray-200" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">সব পরিষ্কার!</h3>
            <p className="text-sm font-bold text-gray-400">বর্তমানে কোনো পেন্ডিং আইটেম নেই</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Item Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-black text-gray-900 mb-1">
                            {activeTab === 'posts' ? item.text.substring(0, 50) + (item.text.length > 50 ? '...' : '') : 
                             activeTab === 'businesses' ? item.name : 
                             activeTab === 'reports' ? item.contentTitle : 
                             item.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400">
                            <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">
                              <User size={12} /> {item.userName || item.ownerName || item.complainantName || "Anonymous"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} /> {new Date(item.createdAt?.seconds ? item.createdAt.toDate() : item.createdAt).toLocaleDateString('bn-BD')}
                            </span>
                            {item.category && (
                              <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600 uppercase tracking-widest text-[9px]">
                                {item.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-colors shadow-sm">
                          <Eye size={18} />
                        </button>
                      </div>

                      <div className="p-5 bg-[#F8FAFC] rounded-3xl border border-gray-50">
                        <p className="text-sm font-medium text-gray-600 leading-relaxed">
                          {activeTab === 'posts' ? item.text : 
                           activeTab === 'businesses' ? item.description : 
                           activeTab === 'reports' ? item.details : 
                           item.description}
                        </p>
                        {item.imageUrl && (
                          <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 max-w-sm">
                            <img src={item.imageUrl} alt="Preview" className="w-full h-auto" />
                          </div>
                        )}
                      </div>

                      {activeTab === 'complaints' && item.unionName && (
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-rose-50 p-3 rounded-2xl border border-rose-100 w-fit">
                          <AlertCircle size={14} className="text-rose-500" /> ইউনিয়ন: {item.unionName}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="lg:w-48 flex flex-row lg:flex-col gap-3 justify-end lg:justify-start">
                      <button 
                        onClick={() => handleAction(item.id, activeTab === 'complaints' ? 'Verified' : 'approved')}
                        disabled={processingId === item.id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
                      >
                        {processingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        এপ্রুভ করুন
                      </button>
                      <button 
                        onClick={() => handleAction(item.id, activeTab === 'complaints' ? 'Rejected' : 'rejected')}
                        disabled={processingId === item.id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-100 text-rose-500 rounded-2xl text-xs font-black hover:bg-rose-50 transition-all shadow-sm disabled:opacity-50"
                      >
                        {processingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                        বাতিল করুন
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentModeration;

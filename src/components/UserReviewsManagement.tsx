import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Search, 
  Filter, 
  MessageSquare, 
  ThumbsUp, 
  UserCheck, 
  AlertCircle, 
  Eye, 
  RefreshCw,
  ExternalLink,
  Flag
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import UniversalReportAdminPanel from './admin/UniversalReportAdminPanel';

interface ReviewItem {
  id: string;
  itemId: string;
  itemName: string;
  itemCategory?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  isVerifiedUser?: boolean;
  rating: number;
  title?: string;
  comment: string;
  recommend?: boolean;
  helpfulCount?: number;
  reportCount?: number;
  status?: 'approved' | 'pending' | 'reported' | 'rejected';
  createdAt: string;
}

interface ReportItem {
  id: string;
  reviewId: string;
  itemName: string;
  reporterName: string;
  reason: string;
  details?: string;
  createdAt: string;
  status: string;
}

export default function UserReviewsManagement() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'universal_reports'>('reviews');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'reported' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [starFilter, setStarFilter] = useState<number | null>(null);

  // Selected Review for details
  const [activeReview, setActiveReview] = useState<ReviewItem | null>(null);

  // Fetch real-time reviews
  useEffect(() => {
    setLoading(true);
    const qReviews = query(collection(db, 'ratings_reviews'));
    const unsubReviews = onSnapshot(
      qReviews,
      (snapshot) => {
        const list: ReviewItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            itemId: data.itemId || '',
            itemName: data.itemName || 'সাধারণ সার্ভিস',
            itemCategory: data.itemCategory || 'general',
            userId: data.userId || '',
            userName: data.userName || 'নাগরিক',
            userPhoto: data.userPhoto || '',
            isVerifiedUser: Boolean(data.isVerifiedUser),
            rating: Number(data.rating) || 5,
            title: data.title || '',
            comment: data.comment || '',
            recommend: data.recommend !== false,
            helpfulCount: Number(data.helpfulCount) || 0,
            reportCount: Number(data.reportCount) || 0,
            status: data.status || 'approved',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });

        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching reviews:', err);
        setLoading(false);
      }
    );

    // Fetch reports
    const qReports = query(collection(db, 'review_reports'));
    const unsubReports = onSnapshot(
      qReports,
      (snapshot) => {
        const rList: ReportItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          rList.push({
            id: docSnap.id,
            reviewId: data.reviewId || '',
            itemName: data.itemName || '',
            reporterName: data.reporterName || 'নাগরিক',
            reason: data.reason || 'রিপোর্ট',
            details: data.details || '',
            createdAt: data.createdAt || new Date().toISOString(),
            status: data.status || 'pending',
          });
        });
        setReports(rList);
      },
      (err) => {
        console.warn('Reports collection query warn:', err);
      }
    );

    return () => {
      unsubReviews();
      unsubReports();
    };
  }, []);

  // Filtered List
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (starFilter && Math.round(r.rating) !== starFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = r.userName.toLowerCase().includes(q);
        const matchItem = r.itemName.toLowerCase().includes(q);
        const matchComment = r.comment.toLowerCase().includes(q);
        if (!matchUser && !matchItem && !matchComment) return false;
      }
      return true;
    });
  }, [reviews, statusFilter, starFilter, searchQuery]);

  // Actions
  const handleUpdateStatus = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'ratings_reviews', reviewId), {
        status: newStatus,
        moderatedAt: new Date().toISOString(),
      });
      toast.success(`রিভিউ স্ট্যাটাস পরিবর্তন করে '${newStatus === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}' করা হয়েছে`);
    } catch (e) {
      console.error('Update review status error:', e);
      toast.error('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই রিভিউটি চিরতরে মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'ratings_reviews', reviewId));
      toast.success('রিভিউটি সফলভাবে মুছে ফেলা হয়েছে');
    } catch (e) {
      console.error('Delete review error:', e);
      toast.error('রিভিউ মুছতে সমস্যা হয়েছে');
    }
  };

  const reportedCount = reviews.filter((r) => r.status === 'reported' || (r.reportCount || 0) > 0).length;

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Top Moderation Mode Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-xl">
        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 border-none ${
            activeTab === 'reviews'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Star size={15} className="text-amber-500 fill-amber-400" />
          <span>গ্লোবাল রিভিউ ও রেটিং</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('universal_reports')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 border-none ${
            activeTab === 'universal_reports'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-rose-700'
          }`}
        >
          <Flag size={15} />
          <span>সর্বজনীন ইউজার রিপোর্টস (60 Pages)</span>
        </button>
      </div>

      {activeTab === 'universal_reports' ? (
        <UniversalReportAdminPanel />
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-600 fill-amber-400" />
                <span>গ্লোবাল রিভিউ ও রেটিং মডারেশন প্যানেল</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                প্লাটফর্মের সকল সার্ভিস, ডাক্তার, হাসপাতাল ও ব্যবসার রিভিউ পর্যবেক্ষণ ও মডারেট করুন
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-black">
                মোট রিভিউ: {reviews.length}টি
              </span>
              {reportedCount > 0 && (
                <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-black animate-pulse flex items-center gap-1">
                  <ShieldAlert size={13} /> {reportedCount}টি ফ্ল্যাগড
                </span>
              )}
            </div>
          </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ইউজার, সার্ভিস বা মন্তব্যে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Status Tabs */}
        <div className="sm:col-span-7 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition ${
              statusFilter === 'all'
                ? 'bg-[#006a4e] text-white border-[#006a4e]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            সবগুলো ({reviews.length})
          </button>

          <button
            onClick={() => setStatusFilter('reported')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition flex items-center gap-1 ${
              statusFilter === 'reported'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert size={12} />
            <span>রিপোর্টেড / ফ্ল্যাগড ({reportedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            অনুমোদিত ({reviews.filter((r) => r.status === 'approved').length})
          </button>

          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition ${
              statusFilter === 'rejected'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            বাতিলকৃত ({reviews.filter((r) => r.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs font-bold border-b border-slate-200">
              <th className="p-3">রিভিউদাতা ও নাগরিক</th>
              <th className="p-3">সার্ভিস/আইটেম</th>
              <th className="p-3">রেটিং</th>
              <th className="p-3">মন্তব্য ও শিরোনাম</th>
              <th className="p-3 text-center">উপকারী / ফ্ল্যাগ</th>
              <th className="p-3 text-center">স্ট্যাটাস</th>
              <th className="p-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500 animate-pulse">
                  রিভিউ ও রিপোর্ট লোড হচ্ছে...
                </td>
              </tr>
            ) : filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  কোনো রিভিউ পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filteredReviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#006a4e] font-black flex items-center justify-center text-[10px] shrink-0 overflow-hidden">
                        {rev.userPhoto ? (
                          <img src={rev.userPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          rev.userName.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-1">
                          {rev.userName}
                          {rev.isVerifiedUser && (
                            <CheckCircle2 size={11} className="text-emerald-600 fill-emerald-100" />
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(rev.createdAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 font-bold text-slate-800">
                    <span className="line-clamp-1">{rev.itemName}</span>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1 font-bold text-amber-600">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span>{rev.rating}.০</span>
                    </div>
                  </td>

                  <td className="p-3 max-w-xs">
                    {rev.title && <p className="font-bold text-slate-900 truncate">{rev.title}</p>}
                    <p className="text-slate-600 line-clamp-2 text-[11px] font-medium">{rev.comment}</p>
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center text-[10px]">
                      <span className="text-emerald-700 font-bold">👍 {rev.helpfulCount || 0}</span>
                      {rev.reportCount ? (
                        <span className="text-rose-600 font-bold">🚩 {rev.reportCount}টি রিপোর্ট</span>
                      ) : null}
                    </div>
                  </td>

                  <td className="p-3 text-center">
                    {rev.status === 'rejected' ? (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        প্রত্যাখ্যাত
                      </span>
                    ) : rev.status === 'reported' || (rev.reportCount || 0) > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center gap-1">
                        <ShieldAlert size={10} /> রিপোর্টেড
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        অনুমোদিত
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {rev.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(rev.id, 'approved')}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-none cursor-pointer"
                          title="অনুমোদন করুন"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}

                      {rev.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border-none cursor-pointer"
                          title="প্রত্যাখ্যান করুন"
                        >
                          <XCircle size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 border-none cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useMemo } from "react";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Phone, 
  User, 
  Clock, 
  Flag, 
  AlertTriangle,
  RefreshCw,
  FileText
} from "lucide-react";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "sonner";

export interface UniversalReportRecord {
  id: string;
  contentId: string;
  contentType: string;
  contentTitle: string;
  contentOwnerId?: string;
  contentOwnerName?: string;
  pageUrl?: string;
  reasonId: string;
  reasonLabel: string;
  details?: string;
  proofUrl?: string;
  reporterId: string;
  reporterName: string;
  reporterPhone?: string;
  reporterEmail?: string;
  status: "pending_review" | "resolved" | "dismissed" | "content_hidden";
  createdAt: string;
}

export const UniversalReportAdminPanel: React.FC = () => {
  const [reports, setReports] = useState<UniversalReportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected for modal detail
  const [activeReport, setActiveReport] = useState<UniversalReportRecord | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "universal_reports"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: UniversalReportRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            contentId: data.contentId || "",
            contentType: data.contentType || "সাধারণ",
            contentTitle: data.contentTitle || "শিরোনামহীন বিষয়বস্তু",
            contentOwnerId: data.contentOwnerId || "",
            contentOwnerName: data.contentOwnerName || "",
            pageUrl: data.pageUrl || "",
            reasonId: data.reasonId || "",
            reasonLabel: data.reasonLabel || "আপত্তি",
            details: data.details || "",
            proofUrl: data.proofUrl || "",
            reporterId: data.reporterId || "guest",
            reporterName: data.reporterName || "নাগরিক",
            reporterPhone: data.reporterPhone || "",
            reporterEmail: data.reporterEmail || "",
            status: data.status || "pending_review",
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });

        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReports(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching universal reports:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Unique Content Types
  const contentTypes = useMemo(() => {
    const types = new Set(reports.map((r) => r.contentType));
    return Array.from(types);
  }, [reports]);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "all" && r.contentType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.contentTitle.toLowerCase().includes(q);
        const matchReporter = r.reporterName.toLowerCase().includes(q);
        const matchPhone = (r.reporterPhone || "").includes(q);
        const matchDetails = (r.details || "").toLowerCase().includes(q);
        if (!matchTitle && !matchReporter && !matchPhone && !matchDetails) return false;
      }
      return true;
    });
  }, [reports, statusFilter, typeFilter, searchQuery]);

  // Actions
  const handleUpdateStatus = async (reportId: string, newStatus: UniversalReportRecord["status"]) => {
    try {
      await updateDoc(doc(db, "universal_reports", reportId), {
        status: newStatus,
        reviewedAt: new Date().toISOString(),
      });
      toast.success("রিপোর্টের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে");
      if (activeReport?.id === reportId) {
        setActiveReport({ ...activeReport, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating report status:", err);
      toast.error("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে");
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই রিপোর্ট রেকর্ডটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "universal_reports", reportId));
      toast.success("রিপোর্ট রেকর্ডটি সফলভাবে মুছে ফেলা হয়েছে");
      if (activeReport?.id === reportId) setActiveReport(null);
    } catch (err) {
      console.error("Error deleting report:", err);
      toast.error("রিপোর্ট রেকর্ড মুছতে সমস্যা হয়েছে");
    }
  };

  const pendingCount = reports.filter((r) => r.status === "pending_review").length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>সর্বজনীন ইউজার কন্টেন্ট মডারেশন প্যানেল (Universal Report System)</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            প্লাটফর্মের ৬০টি পেজে নাগরিক ও ব্যবহারকারীদের দেয়া আপত্তি, ফেক তথ্য ও রিপোর্টের তালিকা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-black">
            মোট রিপোর্ট: {reports.length}টি
          </span>
          {pendingCount > 0 && (
            <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-black animate-pulse flex items-center gap-1">
              <AlertTriangle size={13} /> {pendingCount}টি অপেক্ষমান
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
            placeholder="কন্টেন্ট শিরোনাম, রিপোর্টার বা ফোনে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Type & Status Filter */}
        <div className="sm:col-span-7 flex items-center gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">সকল ক্যাটাগরি ({contentTypes.length})</option>
            {contentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="pending_review">অপেক্ষমান ({pendingCount})</option>
            <option value="resolved">সমাধানকৃত</option>
            <option value="content_hidden">কন্টেন্ট লুকানো</option>
            <option value="dismissed">বাতিলকৃত</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs font-bold border-b border-slate-200">
              <th className="p-3">রিপোর্ট করা বিষয়বস্তু</th>
              <th className="p-3">ক্যাটাগরি</th>
              <th className="p-3">আপত্তির কারণ</th>
              <th className="p-3">রিপোর্টার ও ফোন</th>
              <th className="p-3">তারিখ</th>
              <th className="p-3 text-center">স্ট্যাটাস</th>
              <th className="p-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500 animate-pulse">
                  সর্বজনীন রিপোর্ট ডাটা লোড হচ্ছে...
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  কোনো রিপোর্ট পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filteredReports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900 max-w-xs">
                    <p className="line-clamp-1">{r.contentTitle}</p>
                    {r.pageUrl && (
                      <a
                        href={r.pageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-700 font-medium hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <ExternalLink size={10} /> পেজ দেখুন
                      </a>
                    )}
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                      {r.contentType}
                    </span>
                  </td>

                  <td className="p-3 font-bold text-rose-700 max-w-xs">
                    <p className="truncate">{r.reasonLabel}</p>
                    {r.details && (
                      <p className="text-[10px] text-slate-500 font-medium line-clamp-1">{r.details}</p>
                    )}
                  </td>

                  <td className="p-3">
                    <p className="font-bold text-slate-800">{r.reporterName}</p>
                    {r.reporterPhone && (
                      <p className="text-[10px] text-slate-500 font-mono">{r.reporterPhone}</p>
                    )}
                  </td>

                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    {new Date(r.createdAt).toLocaleDateString("bn-BD")}
                  </td>

                  <td className="p-3 text-center">
                    {r.status === "pending_review" ? (
                      <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-black animate-pulse">
                        অপেক্ষমান
                      </span>
                    ) : r.status === "resolved" ? (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                        সমাধানকৃত
                      </span>
                    ) : r.status === "content_hidden" ? (
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold">
                        লুকানো
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
                        বাতিল
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveReport(r)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border-none cursor-pointer"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye size={14} />
                      </button>

                      {r.status !== "resolved" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(r.id, "resolved")}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-none cursor-pointer"
                          title="সমাধান করা হয়েছে চিহ্নিত করুন"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteReport(r.id)}
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

      {/* Detail Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="text-rose-600" size={18} />
                <span>রিপোর্ট বিশদ বিবরণ</span>
              </h4>
              <button
                onClick={() => setActiveReport(null)}
                className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">বিষয়বস্তু:</span>
                <p className="font-bold text-slate-900">{activeReport.contentTitle}</p>
                <p className="text-[11px] text-rose-600 font-bold">ক্যাটাগরি: {activeReport.contentType}</p>
              </div>

              <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200">
                <p className="font-black text-rose-900">{activeReport.reasonLabel}</p>
                {activeReport.details && (
                  <p className="text-rose-800 mt-1 font-medium">{activeReport.details}</p>
                )}
              </div>

              {activeReport.proofUrl && (
                <div>
                  <span className="text-[10px] text-slate-400">প্রমাণ লিংক:</span>
                  <a
                    href={activeReport.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block font-bold text-indigo-600 underline truncate"
                  >
                    {activeReport.proofUrl}
                  </a>
                </div>
              )}

              <div className="border-t border-slate-100 pt-2 space-y-1 text-slate-600">
                <p>
                  <strong>রিপোর্টার:</strong> {activeReport.reporterName}
                </p>
                <p>
                  <strong>ফোন:</strong> {activeReport.reporterPhone || "প্রদান করা হয়নি"}
                </p>
                <p>
                  <strong>তারিখ:</strong> {new Date(activeReport.createdAt).toLocaleString("bn-BD")}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleUpdateStatus(activeReport.id, "resolved")}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer"
              >
                সমাধানকৃত মার্ক করুন
              </button>

              <button
                onClick={() => handleUpdateStatus(activeReport.id, "dismissed")}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border-none cursor-pointer"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalReportAdminPanel;

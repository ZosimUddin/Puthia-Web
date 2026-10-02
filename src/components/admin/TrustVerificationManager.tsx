import React, { useState, useEffect, useMemo } from "react";
import { 
  ShieldCheck, 
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
  AlertTriangle,
  RefreshCw,
  FileText,
  History,
  Award,
  Store,
  Landmark,
  Building2,
  Plus,
  Sparkles,
  Lock,
  UserCheck
} from "lucide-react";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { VerificationBadge, VerificationType, VERIFICATION_TYPES_CONFIG } from "../common/VerificationBadge";
import { VerificationApplyModal } from "../common/VerificationApplyModal";
import { logAuditActivity } from "../../services/auditLogger";

export interface VerificationRequestRecord {
  id: string;
  applicantUid: string;
  applicantName: string;
  applicantEmail?: string;
  entityId?: string;
  entityType: VerificationType;
  entityName: string;
  registrationNo?: string;
  phone: string;
  address?: string;
  proofUrl?: string;
  description?: string;
  status: "pending" | "verified" | "rejected" | "correction_required";
  requestedBadgeLabel?: string;
  adminNote?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
}

export interface VerificationHistoryLog {
  id: string;
  requestId: string;
  entityName: string;
  entityType: VerificationType;
  action: "verified" | "rejected" | "revoked" | "updated";
  assignedBadge: string;
  adminName: string;
  adminEmail: string;
  note?: string;
  timestamp: string;
}

export const TrustVerificationManager: React.FC = () => {
  const { user, userProfile } = useAuth();

  const [requests, setRequests] = useState<VerificationRequestRecord[]>([]);
  const [historyLogs, setHistoryLogs] = useState<VerificationHistoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"requests" | "history">("requests");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Inspect / Action Modal
  const [activeRequest, setActiveRequest] = useState<VerificationRequestRecord | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [selectedBadgeType, setSelectedBadgeType] = useState<VerificationType>("business");
  const [isNewApplyOpen, setIsNewApplyOpen] = useState(false);

  // Real-time listener for verification requests
  useEffect(() => {
    setLoading(true);
    const qRequests = query(collection(db, "verification_requests"));

    const unsubRequests = onSnapshot(
      qRequests,
      (snapshot) => {
        const list: VerificationRequestRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            applicantUid: data.applicantUid || "guest",
            applicantName: data.applicantName || "আবেদনকারী",
            applicantEmail: data.applicantEmail || "",
            entityId: data.entityId || "",
            entityType: (data.entityType as VerificationType) || "business",
            entityName: data.entityName || "নামহীন প্রতিষ্ঠান",
            registrationNo: data.registrationNo || "",
            phone: data.phone || "",
            address: data.address || "",
            proofUrl: data.proofUrl || "",
            description: data.description || "",
            status: data.status || "pending",
            requestedBadgeLabel: data.requestedBadgeLabel || "",
            adminNote: data.adminNote || "",
            verifiedAt: data.verifiedAt || "",
            verifiedBy: data.verifiedBy || "",
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });

        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRequests(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading verification requests:", err);
        setLoading(false);
      }
    );

    // Listener for history logs
    const qHistory = query(collection(db, "verification_history"));
    const unsubHistory = onSnapshot(
      qHistory,
      (snapshot) => {
        const hList: VerificationHistoryLog[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          hList.push({
            id: docSnap.id,
            requestId: data.requestId || "",
            entityName: data.entityName || "",
            entityType: (data.entityType as VerificationType) || "user",
            action: data.action || "verified",
            assignedBadge: data.assignedBadge || "",
            adminName: data.adminName || "এডমিন",
            adminEmail: data.adminEmail || "",
            note: data.note || "",
            timestamp: data.timestamp || new Date().toISOString(),
          });
        });

        hList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setHistoryLogs(hList);
      },
      (err) => {
        console.warn("History logs listener:", err);
      }
    );

    return () => {
      unsubRequests();
      unsubHistory();
    };
  }, []);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "all" && r.entityType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.entityName.toLowerCase().includes(q);
        const matchPhone = (r.phone || "").includes(q);
        const matchReg = (r.registrationNo || "").toLowerCase().includes(q);
        const matchApplicant = r.applicantName.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchReg && !matchApplicant) return false;
      }
      return true;
    });
  }, [requests, statusFilter, typeFilter, searchQuery]);

  // Statistics
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const verifiedCount = requests.filter((r) => r.status === "verified").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  // Actions
  const handleApprove = async (record: VerificationRequestRecord) => {
    const adminName = userProfile?.name || user?.displayName || "এডমিন টিম";
    const adminEmail = user?.email || "";
    const badgeConfig = VERIFICATION_TYPES_CONFIG[selectedBadgeType];

    try {
      // 1. Update request record
      await updateDoc(doc(db, "verification_requests", record.id), {
        status: "verified",
        entityType: selectedBadgeType,
        verifiedAt: new Date().toISOString(),
        verifiedBy: adminName,
        adminNote: adminNoteInput.trim() || "তথ্য যাচাইপূর্বক ভেরিফাইড ব্যাজ অনুমোদন দেওয়া হলো।",
        updatedAt: new Date().toISOString(),
      });

      // 1.5 Update user profile document if applicantUid is valid
      if (record.applicantUid && record.applicantUid !== "guest") {
        try {
          await updateDoc(doc(db, "users", record.applicantUid), {
            verificationStatus: "verified",
            isVerified: true,
            authorBadge: true,
            verificationType: selectedBadgeType,
            verifiedAt: new Date().toISOString(),
            verifiedBy: adminName
          });
        } catch (uErr) {
          console.warn("Could not update user doc directly:", uErr);
        }
      }

      // 2. Add history audit log
      await addDoc(collection(db, "verification_history"), {
        requestId: record.id,
        entityName: record.entityName,
        entityType: selectedBadgeType,
        action: "verified",
        assignedBadge: badgeConfig.label,
        adminName,
        adminEmail,
        note: adminNoteInput.trim() || "ভেরিফাইড ব্যাজ অনুমোদন দেওয়া হলো।",
        timestamp: new Date().toISOString(),
      });

      // 3. Log to Global Activity & Audit Log
      await logAuditActivity({
        action: "ভেরিফিকেশন ব্যাজ অনুমোদন",
        details: `${record.entityName}-কে '${badgeConfig.label}' ব্যাজ অনুমোদন দেওয়া হয়েছে।`,
        category: "security",
        severity: "info",
        changes: {
          status: { old: "pending", new: "verified" },
          badge: { old: "none", new: badgeConfig.label },
          adminNote: { old: "", new: adminNoteInput.trim() || "তথ্য যাচাইপূর্বক ভেরিফাইড ব্যাজ অনুমোদন দেওয়া হলো।" }
        },
        customUser: adminName,
        customEmail: adminEmail
      });

      toast.success(`${record.entityName}-কে ${badgeConfig.label} ব্যাজ সফলভাবে দেওয়া হয়েছে!`);
      setActiveRequest(null);
      setAdminNoteInput("");
    } catch (err) {
      console.error("Error approving verification:", err);
      toast.error("অনুমোদন দিতে সমস্যা হয়েছে");
    }
  };

  const handleReject = async (record: VerificationRequestRecord) => {
    const adminName = userProfile?.name || user?.displayName || "এডমিন টিম";
    const adminEmail = user?.email || "";

    try {
      await updateDoc(doc(db, "verification_requests", record.id), {
        status: "rejected",
        adminNote: adminNoteInput.trim() || "তথ্য বা কাগজপত্রে অসামঞ্জস্য পাওয়ায় বাতিল করা হলো।",
        updatedAt: new Date().toISOString(),
      });

      await addDoc(collection(db, "verification_history"), {
        requestId: record.id,
        entityName: record.entityName,
        entityType: record.entityType,
        action: "rejected",
        assignedBadge: "নাই",
        adminName,
        adminEmail,
        note: adminNoteInput.trim() || "আবেদনটি বাতিল করা হয়েছে।",
        timestamp: new Date().toISOString(),
      });

      // Log to Global Activity & Audit Log
      await logAuditActivity({
        action: "ভেরিফিকেশন আবেদন বাতিল",
        details: `${record.entityName}-এর ভেরিফিকেশন আবেদনটি বাতিল করা হয়েছে।`,
        category: "security",
        severity: "warning",
        changes: {
          status: { old: "pending", new: "rejected" },
          adminNote: { old: "", new: adminNoteInput.trim() || "তথ্য বা কাগজপত্রে অসামঞ্জস্য পাওয়ায় বাতিল করা হলো।" }
        },
        customUser: adminName,
        customEmail: adminEmail
      });

      toast.success("আবেদনটি বাতিল করা হয়েছে");
      setActiveRequest(null);
      setAdminNoteInput("");
    } catch (err) {
      console.error("Error rejecting verification:", err);
      toast.error("বাতিল করতে সমস্যা হয়েছে");
    }
  };

  const handleRevoke = async (record: VerificationRequestRecord) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে ${record.entityName}-এর ভেরিফাইড ব্যাজ বাতিল/প্রত্যাহার করতে চান?`)) return;

    const adminName = userProfile?.name || user?.displayName || "এডমিন টিম";
    const adminEmail = user?.email || "";

    try {
      await updateDoc(doc(db, "verification_requests", record.id), {
        status: "rejected",
        adminNote: "ভেরিফিকেশন ব্যাজ প্রত্যাহার করা হয়েছে।",
        updatedAt: new Date().toISOString(),
      });

      await addDoc(collection(db, "verification_history"), {
        requestId: record.id,
        entityName: record.entityName,
        entityType: record.entityType,
        action: "revoked",
        assignedBadge: "প্রত্যাহৃত",
        adminName,
        adminEmail,
        note: "ভেরিফাইড ব্যাজ প্রত্যাহার করা হয়েছে।",
        timestamp: new Date().toISOString(),
      });

      // Log to Global Activity & Audit Log
      await logAuditActivity({
        action: "ভেরিফিকেশন ব্যাজ প্রত্যাহার",
        details: `${record.entityName}-এর ভেরিফিকেশন ব্যাজ প্রত্যাহার করা হয়েছে।`,
        category: "security",
        severity: "critical",
        changes: {
          status: { old: "verified", new: "rejected" },
          reason: { old: "", new: "ভেরিফিকেশন ব্যাজ প্রত্যাহার করা হয়েছে।" }
        },
        customUser: adminName,
        customEmail: adminEmail
      });

      toast.success("ভেরিফাইড ব্যাজ সফলভাবে প্রত্যাহার করা হয়েছে");
      setActiveRequest(null);
    } catch (err) {
      console.error("Error revoking badge:", err);
      toast.error("ব্যাজ প্রত্যাহার করতে সমস্যা হয়েছে");
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm("আপনি কি রেকর্ডটি স্থায়ীভাবে মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "verification_requests", recordId));
      toast.success("রেকর্ড মুছে ফেলা হয়েছে");
      if (activeRequest?.id === recordId) setActiveRequest(null);
    } catch (err) {
      console.error("Error deleting request:", err);
      toast.error("রেকর্ড মুছতে সমস্যা হয়েছে");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 text-left font-sans">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/20 backdrop-blur-md rounded-xl text-emerald-400">
              <ShieldCheck size={22} />
            </span>
            <h3 className="text-lg font-black text-white leading-tight">
              Verification & Trust System (ভেরিফিকেশন ও ট্রাস্ট ম্যানেজমেন্ট)
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-medium pl-10 max-w-xl">
            ✓ Verified Citizen, Verified Business, Verified Institution, Verified Professional এবং Verified Organization এর অনুমোদন ও ইতিহাস
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewApplyOpen(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md shrink-0"
        >
          <Plus size={16} />
          <span>নতুন ভেরিফিকেশন যুক্ত করুন</span>
        </button>
      </div>

      {/* Main Tabs (Requests vs Admin Verification History) */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-lg">
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 border-none ${
            activeTab === "requests"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserCheck size={15} className="text-emerald-600" />
          <span>ভেরিফিকেশন আবেদনসমূহ ({requests.length})</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-bold animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 border-none ${
            activeTab === "history"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <History size={15} className="text-amber-400" />
          <span>অ্যাডমিন অডিট হিস্ট্রি ({historyLogs.length})</span>
        </button>
      </div>

      {/* VIEW 1: Verification Requests Queue */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {/* Summary Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">মোট আবেদন</span>
              <p className="text-xl font-black text-slate-900">{requests.length}টি</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3">
              <span className="text-[10px] font-bold uppercase text-rose-600 block">অপেক্ষমান (Pending)</span>
              <p className="text-xl font-black text-rose-700">{pendingCount}টি</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">অনুমোদিত (Verified)</span>
              <p className="text-xl font-black text-emerald-800">{verifiedCount}টি</p>
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3">
              <span className="text-[10px] font-bold uppercase text-slate-600 block">বাতিল (Rejected)</span>
              <p className="text-xl font-black text-slate-700">{rejectedCount}টি</p>
            </div>
          </div>

          {/* Toolbar Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="প্রতিষ্ঠান/ব্যক্তির নাম, লাইসেন্স বা ফোনে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-7 flex items-center gap-2 flex-wrap">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">সকল টাইপ (৫টি ক্যাটাগরি)</option>
                <option value="user">✓ Verified Citizen</option>
                <option value="business">Verified Business</option>
                <option value="institution">Verified Institution</option>
                <option value="professional">Verified Professional</option>
                <option value="organization">Verified Organization</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">সকল স্ট্যাটাস</option>
                <option value="pending">অপেক্ষমান ({pendingCount})</option>
                <option value="verified">অনুমোদিত ({verifiedCount})</option>
                <option value="rejected">বাতিলকৃত</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-bold border-b border-slate-200">
                  <th className="p-3">প্রতিষ্ঠান / ব্যক্তির নাম</th>
                  <th className="p-3">ব্যাজ ক্যাটাগরি</th>
                  <th className="p-3">লাইসেন্স / রেজি নম্বর</th>
                  <th className="p-3">আবেদনকারী ও ফোন</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3 text-center">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500 animate-pulse">
                      ভেরিফিকেশন ডাটা লোড হচ্ছে...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      কোনো ভেরিফিকেশন আবেদন পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900 max-w-xs">
                        <p className="line-clamp-1">{r.entityName}</p>
                        {r.address && (
                          <p className="text-[10px] text-slate-500 font-medium truncate">{r.address}</p>
                        )}
                      </td>

                      <td className="p-3">
                        <VerificationBadge type={r.entityType} variant="chip" size="xs" />
                      </td>

                      <td className="p-3 font-mono text-[11px] text-slate-700">
                        {r.registrationNo || "প্রদান করা হয়নি"}
                      </td>

                      <td className="p-3">
                        <p className="font-bold text-slate-800">{r.applicantName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{r.phone}</p>
                      </td>

                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString("bn-BD")}
                      </td>

                      <td className="p-3 text-center">
                        {r.status === "pending" ? (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-black animate-pulse">
                            অপেক্ষমান
                          </span>
                        ) : r.status === "verified" ? (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                            ✓ ভেরিফাইড
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
                            onClick={() => {
                              setActiveRequest(r);
                              setSelectedBadgeType(r.entityType);
                              setAdminNoteInput(r.adminNote || "");
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-none cursor-pointer font-bold flex items-center gap-1 text-[11px]"
                          >
                            <Eye size={13} /> পর্যালোচনা
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(r.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 border-none cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={13} />
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

      {/* VIEW 2: Admin Verification History & Audit Logs */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-1">
            <h4 className="text-sm font-black flex items-center gap-2 text-amber-400">
              <History size={16} />
              <span>Admin Verification Audit Logs & History (অ্যাডমিন ভেরিফিকেশন ইতিহাস)</span>
            </h4>
            <p className="text-xs text-slate-300">
              সকল এডমিন কর্তৃক ভেরিফাইড ব্যাজ অনুমোদন, পরিবর্তন বা বাতিলের তারিখভিত্তিক স্থায়ী রেকর্ড।
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-bold border-b border-slate-200">
                  <th className="p-3">সময় ও তারিখ</th>
                  <th className="p-3">প্রতিষ্ঠান / ব্যক্তির নাম</th>
                  <th className="p-3">অ্যাকশন</th>
                  <th className="p-3">অ্যাসাইন করা ব্যাজ</th>
                  <th className="p-3">সম্পাদনকারী এডমিন</th>
                  <th className="p-3">এডমিন মন্তব্য</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {historyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      কোনো এডমিন ভেরিফিকেশন ইতিহাস রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  historyLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString("bn-BD")}
                      </td>

                      <td className="p-3 font-bold text-slate-900">
                        {log.entityName}
                      </td>

                      <td className="p-3">
                        {log.action === "verified" ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                            অনুমোদন (Verified)
                          </span>
                        ) : log.action === "rejected" ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                            বাতিল (Rejected)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px]">
                            প্রত্যাহার (Revoked)
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-bold text-emerald-800">
                        {log.assignedBadge || "N/A"}
                      </td>

                      <td className="p-3">
                        <p className="font-bold text-slate-800">{log.adminName}</p>
                        {log.adminEmail && (
                          <p className="text-[10px] text-slate-400 font-mono">{log.adminEmail}</p>
                        )}
                      </td>

                      <td className="p-3 text-slate-600 italic max-w-xs">
                        {log.note || "কোনো নোট নেই"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action / Review Modal */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-sans text-left border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={18} />
                <span>ভেরিফিকেশন আবেদন ও ব্যাজ নির্ধারণ</span>
              </h4>
              <button
                onClick={() => setActiveRequest(null)}
                className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">আবেদনকৃত প্রতিষ্ঠানের নাম:</span>
                <p className="text-sm font-black text-slate-900">{activeRequest.entityName}</p>
                <p className="text-[11px] text-slate-600">আবেদনকারী: {activeRequest.applicantName} ({activeRequest.phone})</p>
                {activeRequest.registrationNo && (
                  <p className="text-[11px] text-slate-700 font-mono">লাইসেন্স/রেজি: {activeRequest.registrationNo}</p>
                )}
                {activeRequest.address && (
                  <p className="text-[11px] text-slate-600">ঠিকানা: {activeRequest.address}</p>
                )}
              </div>

              {activeRequest.proofUrl && (
                <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 block">প্রমাণপত্র লিংক:</span>
                  <a
                    href={activeRequest.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-emerald-700 underline truncate block mt-0.5"
                  >
                    {activeRequest.proofUrl}
                  </a>
                </div>
              )}

              {/* Select Badge Type to Assign */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-black text-slate-800">
                  যে ভেরিফাইড ব্যাজটি বরাদ্দ করতে চান:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(VERIFICATION_TYPES_CONFIG) as VerificationType[]).map((type) => {
                    const cfg = VERIFICATION_TYPES_CONFIG[type];
                    const Icon = cfg.icon;
                    const isSelected = selectedBadgeType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedBadgeType(type)}
                        className={`p-2 rounded-xl border text-[11px] font-bold transition text-left flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? `${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass} ring-2 ring-emerald-500/40 font-black`
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={14} className="shrink-0" />
                        <span className="truncate">{cfg.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview Assigned Badge */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">প্রিভিউ ব্যাজ:</span>
                <VerificationBadge type={selectedBadgeType} variant="full" />
              </div>

              {/* Admin Note Input */}
              <div className="space-y-1 pt-1">
                <label className="block text-xs font-bold text-slate-800">
                  এডমিন মন্তব্য / নোট:
                </label>
                <textarea
                  rows={2}
                  placeholder="অনুমোদন বা বাতিলের কারণ লিখুন..."
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600 resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              {activeRequest.status === "verified" ? (
                <button
                  onClick={() => handleRevoke(activeRequest)}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer"
                >
                  ব্যাজ প্রত্যাহার করুন
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleApprove(activeRequest)}
                    className="flex-1 py-2.5 bg-[#006a4e] hover:bg-[#00543e] text-white rounded-xl text-xs font-black border-none cursor-pointer flex items-center justify-center gap-1 shadow-md"
                  >
                    <CheckCircle2 size={15} />
                    <span>ভেরিফাইড ব্যাজ প্রদান করুন</span>
                  </button>

                  <button
                    onClick={() => handleReject(activeRequest)}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold border-none cursor-pointer"
                  >
                    বাতিল করুন
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Apply Modal trigger */}
      <VerificationApplyModal
        isOpen={isNewApplyOpen}
        onClose={() => setIsNewApplyOpen(false)}
      />
    </div>
  );
};

export default TrustVerificationManager;

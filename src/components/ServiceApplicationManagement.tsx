import React, { useState, useEffect } from "react";
import { 
  getServiceApplications, 
  updateServiceApplicationStatus 
} from "../api";
import { ServiceApplication } from "../types";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  FileText,
  User,
  Phone,
  MapPin,
  MessageSquare,
  ChevronDown
} from "lucide-react";

export default function ServiceApplicationManagement() {
  const [applications, setApplications] = useState<ServiceApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ServiceApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnion, setSelectedUnion] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedApp, setSelectedApp] = useState<ServiceApplication | null>(null);
  
  // Feedback edit state
  const [feedback, setFeedback] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await getServiceApplications();
      setApplications(data);
      setFilteredApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    let result = applications;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (app) =>
          app.applicantName.toLowerCase().includes(term) ||
          app.applicantPhone.includes(term) ||
          app.id.toLowerCase().includes(term)
      );
    }

    if (selectedUnion) {
      result = result.filter((app) => app.unionName === selectedUnion);
    }

    if (selectedService) {
      result = result.filter((app) => app.serviceType === selectedService);
    }

    if (selectedStatus) {
      result = result.filter((app) => app.status === selectedStatus);
    }

    setFilteredApplications(result);
  }, [searchTerm, selectedUnion, selectedService, selectedStatus, applications]);

  const handleUpdateStatus = async (id: string, newStatus: ServiceApplication["status"]) => {
    setStatusUpdating(true);
    try {
      await updateServiceApplicationStatus(id, newStatus, feedback);
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === id 
            ? { ...app, status: newStatus, adminFeedback: feedback } 
            : app
        )
      );
      
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus, adminFeedback: feedback } : null);
      }
      
      setFeedback("");
      alert("আবেদনের অবস্থা সফলভাবে আপডেট করা হয়েছে।");
    } catch (err) {
      console.error(err);
      alert("অবস্থা আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusBadge = (status: ServiceApplication["status"]) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-full text-xs font-bold border border-sky-500/20 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-emerald-500 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  const translateServiceType = (type: string) => {
    switch (type) {
      case "birth_registration": return "জন্ম নিবন্ধন";
      case "death_registration": return "মৃত্যু নিবন্ধন";
      case "nid_service": return "এনআইডি ও ভোটার সেবা";
      case "e_mutation": return "ই-নামজারি";
      case "citizen_certificate": return "নাগরিকত্ব প্রত্যয়নপত্র";
      case "trade_license": return "ট্রেড লাইসেন্স";
      case "charity_allowance": return "সামাজিক নিরাপত্তা ভাতা";
      default: return "অন্যান্য সেবা";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">নাগরিক ডিজিটাল সেবা আবেদনসমূহ</h2>
          <p className="text-gray-400 text-sm">নাগরিকদের জমা দেওয়া সকল ই-সেবা আবেদনসমূহ যাচাই, অনুমোদন বা বাতিল করুন।</p>
        </div>
        <button 
          onClick={fetchApplications}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
        >
          🔄 রিলোড তালিকা
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1E1E1E] p-4 rounded-2xl border border-gray-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="আবেদনকারী, মোবাইল বা আইডি..."
              value={searchTerm || ""}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/40 border border-gray-800 rounded-xl focus:outline-none focus:border-[#B71C1C] text-sm text-white"
            />
          </div>

          {/* Service Dropdown */}
          <div className="relative">
            <select
              value={selectedService || ""}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/40 border border-gray-800 rounded-xl focus:outline-none focus:border-[#B71C1C] text-sm text-white appearance-none"
            >
              <option value="">সব সেবা ক্যাটাগরি</option>
              <option value="birth_registration">জন্ম নিবন্ধন</option>
              <option value="death_registration">মৃত্যু নিবন্ধন</option>
              <option value="nid_service">এনআইডি ও ভোটার সেবা</option>
              <option value="e_mutation">ই-নামজারি</option>
              <option value="citizen_certificate">নাগরিকত্ব প্রত্যয়নপত্র</option>
              <option value="trade_license">ট্রেড লাইসেন্স</option>
              <option value="charity_allowance">সামাজিক নিরাপত্তা ভাতা</option>
            </select>
          </div>

          {/* Union Dropdown */}
          <div className="relative">
            <select
              value={selectedUnion || ""}
              onChange={(e) => setSelectedUnion(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/40 border border-gray-800 rounded-xl focus:outline-none focus:border-[#B71C1C] text-sm text-white appearance-none"
            >
              <option value="">সব ইউনিয়ন পরিষদ</option>
              <option value="পুঠিয়া সদর ইউনিয়ন">পুঠিয়া সদর ইউনিয়ন</option>
              <option value="বানেশ্বর ইউনিয়ন">বানেশ্বর ইউনিয়ন</option>
              <option value="বেলপুকুরিয়া ইউনিয়ন">বেলপুকুরিয়া ইউনিয়ন</option>
              <option value="ভালুকগাছী ইউনিয়ন">ভালুকগাছী ইউনিয়ন</option>
              <option value="জিল্লা ইউনিয়ন">জিল্লা ইউনিয়ন</option>
              <option value="পৌরসভা">পুঠিয়া পৌরসভা</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus || ""}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/40 border border-gray-800 rounded-xl focus:outline-none focus:border-[#B71C1C] text-sm text-white appearance-none"
            >
              <option value="">সব রকম অবস্থা</option>
              <option value="Pending">Pending (অপেক্ষমান)</option>
              <option value="Processing">Processing (চলমান)</option>
              <option value="Approved">Approved (অনুমোদিত)</option>
              <option value="Rejected">Rejected (বাতিল)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table / Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">আবেদনসমূহ লোড হচ্ছে...</div>
      ) : filteredApplications.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-[#1E1E1E] rounded-2xl border border-gray-800">
          কোনো নাগরিক আবেদন পাওয়া যায়নি।
        </div>
      ) : (
        <div className="bg-[#1E1E1E] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-slate-900/40 text-xs uppercase text-gray-400 font-bold border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">আবেদন আইডি</th>
                  <th className="px-6 py-4">আবেদনকারী ও মোবাইল</th>
                  <th className="px-6 py-4">সেবার বিবরণ</th>
                  <th className="px-6 py-4">ইউনিয়ন</th>
                  <th className="px-6 py-4">তারিখ</th>
                  <th className="px-6 py-4">অবস্থা</th>
                  <th className="px-6 py-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-[#B71C1C]">{app.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{app.applicantName}</div>
                      <div className="text-xs text-gray-500">{app.applicantPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {translateServiceType(app.serviceType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{app.unionName}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString("bn-BD")}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => {
                          setSelectedApp(app);
                          setFeedback(app.adminFeedback || "");
                        }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> বিস্তারিত দেখুন
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#1E1E1E] rounded-3xl w-full max-w-2xl border border-gray-800 shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-[#B71C1C] text-white flex justify-between items-center">
              <div>
                <span className="text-xs bg-white/20 text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
                  আবেদন পর্যালোচনা
                </span>
                <h3 className="text-xl font-bold font-serif">{translateServiceType(selectedApp.serviceType)} আবেদন</h3>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="w-10 h-10 rounded-full bg-slate-900/20 hover:bg-slate-900/30 text-white flex items-center justify-center transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Applicant Demographics */}
              <div className="bg-slate-900/20 rounded-2xl p-4 border border-gray-800 space-y-3">
                <h4 className="text-sm font-bold text-emerald-400 border-b border-gray-800 pb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> আবেদনকারীর মৌলিক তথ্য
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block mb-0.5">আবেদনকারী:</span>
                    <span className="font-bold text-white">{selectedApp.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">মোবাইল নম্বর:</span>
                    <span className="font-bold text-white">{selectedApp.applicantPhone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">এনআইডি:</span>
                    <span className="font-bold text-white">{selectedApp.applicantNid || "প্রদান করা হয়নি"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">ইউনিয়ন পরিষদ:</span>
                    <span className="font-bold text-white">{selectedApp.unionName}</span>
                  </div>
                </div>
              </div>

              {/* Service-Specific Fields */}
              <div className="bg-slate-900/20 rounded-2xl p-4 border border-gray-800 space-y-3">
                <h4 className="text-sm font-bold text-sky-400 border-b border-gray-800 pb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> আবেদনের সুনির্দিষ্ট বিবরণ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {Object.entries(selectedApp.details || {}).map(([key, val]) => {
                    if (key === "attachedFile" || key === "attachedFileName") return null;
                    return (
                      <div key={key} className="border-b border-gray-800/30 pb-1.5">
                        <span className="text-gray-500 block mb-0.5 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-bold text-white text-sm">{val as string}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Document Download Link */}
              {selectedApp.details?.attachedFileName && (
                <div className="bg-slate-900/20 rounded-2xl p-4 border border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h5 className="text-xs text-gray-400 font-bold">সহায়ক সংযুক্ত ফাইল</h5>
                      <p className="text-sm text-white font-bold">{selectedApp.details.attachedFileName}</p>
                    </div>
                  </div>
                  <a 
                    href={selectedApp.details.attachedFile}
                    download={selectedApp.details.attachedFileName}
                    className="px-4 py-2 bg-[#B71C1C] hover:bg-[#D32F2F] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    📥 ফাইল ডাউনলোড
                  </a>
                </div>
              )}

              {/* Status Update Controls */}
                <div className="bg-slate-900/20 rounded-2xl p-4 border border-gray-800 space-y-4">
                <h4 className="text-sm font-bold text-emerald-500 border-b border-gray-800 pb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> আবেদনের অবস্থা ও ফিডব্যাক পরিবর্তন
                </h4>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">অফিসিয়াল বা এডমিন মন্তব্য (Citizen Feedback):</label>
                  <textarea 
                    placeholder="নাগরিক আবেদনের প্রেক্ষিতে কোনো দিকনির্দেশনা, ভুলত্রুটি বা ফিডব্যাক থাকলে এখানে লিখুন..."
                    rows={3}
                    value={feedback || ""}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-gray-800 rounded-xl focus:outline-none focus:border-[#B71C1C] text-sm text-white font-sans"
                  />
                </div>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button 
                    onClick={() => handleUpdateStatus(selectedApp.id, "Processing")}
                    disabled={statusUpdating}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    ⚙️ Processing করুন
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedApp.id, "Approved")}
                    disabled={statusUpdating}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    ✅ অনুমোদন (Approve) করুন
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedApp.id, "Rejected")}
                    disabled={statusUpdating}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    ❌ বাতিল (Reject) করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

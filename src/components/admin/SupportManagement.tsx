import React, { useState, useEffect } from "react";
import { 
  Mail, MessageSquare, AlertCircle, Sparkles, Trash2, Eye, 
  CheckCircle2, Clock, Search, Filter, XCircle, CornerDownRight, 
  Check, Info, Loader2, ArrowRight, MessageSquareCode, ShieldCheck, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getContactMessages, updateContactMessage, deleteContactMessage,
  getComplaints, updateComplaint, deleteComplaint,
  getFeedbacks, deleteFeedback
} from "../../api";
import { ContactMessage, Complaint, Feedback } from "../../types";

export default function SupportManagement() {
  const [activeTab, setActiveTab] = useState<'contact' | 'complaints' | 'suggestions' | 'feedback'>('contact');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Lists
  const [contactList, setContactList] = useState<ContactMessage[]>([]);
  const [complaintList, setComplaintList] = useState<Complaint[]>([]);
  const [suggestionList, setSuggestionList] = useState<Complaint[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected item for details modal
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Fetch all support data
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [contacts, complaints, feedbacks] = await Promise.all([
        getContactMessages(),
        getComplaints(),
        getFeedbacks()
      ]);

      setContactList(contacts);
      
      // Separate complaints and suggestions
      const onlyComplaints = complaints.filter(c => c.category?.toLowerCase() === 'complaint');
      const onlySuggestions = complaints.filter(c => c.category?.toLowerCase() === 'suggestion' || c.category === 'পরামর্শ');
      
      setComplaintList(onlyComplaints);
      setSuggestionList(onlySuggestions);
      setFeedbackList(feedbacks);
    } catch (err: any) {
      console.error("Error fetching support data:", err);
      setErrorMsg("তথ্য লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Set alert message temporarily
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Handle Delete
  const handleDelete = async (id: string, type: 'contact' | 'complaints' | 'suggestions' | 'feedback') => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এটি মুছে ফেলতে চান?")) return;
    
    setLoading(true);
    try {
      if (type === 'contact') {
        await deleteContactMessage(id);
        setContactList(prev => prev.filter(item => item.id !== id));
      } else if (type === 'complaints' || type === 'suggestions') {
        await deleteComplaint(id);
        if (type === 'complaints') {
          setComplaintList(prev => prev.filter(item => item.id !== id));
        } else {
          setSuggestionList(prev => prev.filter(item => item.id !== id));
        }
      } else if (type === 'feedback') {
        await deleteFeedback(id);
        setFeedbackList(prev => prev.filter(item => item.id !== id));
      }
      showSuccess("সফলভাবে মুছে ফেলা হয়েছে!");
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMsg("মুছে ফেলতে ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  // Handle Update Status & Admin Notes
  const handleUpdateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmittingAction(true);
    try {
      const timestamp = new Date().toLocaleDateString('bn-BD');
      
      if (activeTab === 'contact') {
        const updates: Partial<ContactMessage> = {
          status: (newStatus || selectedItem.status) as any,
          adminNotes: adminNoteInput || selectedItem.adminNotes
        };
        await updateContactMessage(selectedItem.id, updates);
        
        setContactList(prev => prev.map(item => item.id === selectedItem.id ? { ...item, ...updates } : item));
        setSelectedItem(prev => ({ ...prev, ...updates }));
        
      } else if (activeTab === 'complaints' || activeTab === 'suggestions') {
        const updatedActionLog = [...(selectedItem.actionLog || [])];
        if (adminNoteInput) {
          updatedActionLog.push({
            message: adminNoteInput,
            date: timestamp
          });
        }
        
        const updates: Partial<Complaint> = {
          status: (newStatus || selectedItem.status) as any,
          actionLog: updatedActionLog
        };
        await updateComplaint(selectedItem.id, updates);

        const updateItemInList = (list: Complaint[]) => 
          list.map(item => item.id === selectedItem.id ? { ...item, ...updates } : item);

        if (activeTab === 'complaints') {
          setComplaintList(prev => updateItemInList(prev));
        } else {
          setSuggestionList(prev => updateItemInList(prev));
        }
        
        setSelectedItem(prev => ({ ...prev, ...updates }));
      }

      showSuccess("সফলভাবে তথ্য আপডেট করা হয়েছে!");
      setAdminNoteInput("");
    } catch (err) {
      console.error("Update error:", err);
      setErrorMsg("আপডেট করতে ব্যর্থ হয়েছে।");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Open detail modal helper
  const openDetails = (item: any) => {
    setSelectedItem(item);
    setNewStatus(item.status || "");
    setAdminNoteInput("");
  };

  // Get current active list for search and filters
  const getFilteredList = () => {
    let currentList: any[] = [];
    if (activeTab === 'contact') currentList = contactList;
    else if (activeTab === 'complaints') currentList = complaintList;
    else if (activeTab === 'suggestions') currentList = suggestionList;
    else if (activeTab === 'feedback') currentList = feedbackList;

    return currentList.filter(item => {
      // Search matches
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.complainantName && item.complainantName.toLowerCase().includes(query)) ||
        (item.subject && item.subject.toLowerCase().includes(query)) ||
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.message && item.message.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.phone && item.phone.toLowerCase().includes(query)) ||
        (item.complainantPhone && item.complainantPhone.toLowerCase().includes(query));

      // Status Filter matches
      const matchesStatus = statusFilter === 'all' || 
        (item.status && item.status.toLowerCase() === statusFilter.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  };

  const filteredList = getFilteredList();

  // Stats calculation
  const getStats = () => {
    const totalContacts = contactList.length;
    const pendingContacts = contactList.filter(c => c.status === 'Pending').length;

    const totalComplaints = complaintList.length;
    const pendingComplaints = complaintList.filter(c => c.status === 'Pending').length;

    const totalSuggestions = suggestionList.length;
    const pendingSuggestions = suggestionList.filter(s => s.status === 'Pending').length;

    const totalFeedback = feedbackList.length;

    return {
      totalContacts, pendingContacts,
      totalComplaints, pendingComplaints,
      totalSuggestions, pendingSuggestions,
      totalFeedback
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header and stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <MessageSquareCode className="text-emerald-600" size={24} />
            গ্রাহক সাপোর্ট ও বার্তা মডারেশন
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            নাগরিকদের পাঠানো যোগাযোগ বার্তা, অভিযোগ, পরামর্শ এবং ফিডব্যাক পরিচালনা করুন
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[12px] transition-all self-start md:self-auto"
        >
          <Loader2 size={14} className={loading ? "animate-spin" : ""} />
          রিফ্রেশ করুন
        </button>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-[16px] flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-[#009664]" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold rounded-[16px] flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-[12px] flex items-center justify-center shrink-0">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400">যোগাযোগ বার্তা</p>
            <p className="text-lg font-black text-slate-800 mt-0.5">{stats.totalContacts}</p>
            <p className="text-[9px] font-bold text-blue-600 mt-0.5">{stats.pendingContacts} টি পেন্ডিং</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-[12px] flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400">নাগরিক অভিযোগ</p>
            <p className="text-lg font-black text-slate-800 mt-0.5">{stats.totalComplaints}</p>
            <p className="text-[9px] font-bold text-rose-600 mt-0.5">{stats.pendingComplaints} টি পেন্ডিং</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-[12px] flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400">পরামর্শ</p>
            <p className="text-lg font-black text-slate-800 mt-0.5">{stats.totalSuggestions}</p>
            <p className="text-[9px] font-bold text-amber-600 mt-0.5">{stats.pendingSuggestions} টি পেন্ডিং</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-[12px] flex items-center justify-center shrink-0">
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400">ফিডব্যাক ও মতামত</p>
            <p className="text-lg font-black text-slate-800 mt-0.5">{stats.totalFeedback}</p>
            <p className="text-[9px] font-bold text-emerald-600 mt-0.5">১০০% নাগরিক রেটিং</p>
          </div>
        </div>
      </div>

      {/* Main interface card */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Navigation subtabs */}
        <div className="flex border-b border-slate-100 p-2 gap-1 bg-slate-50/50">
          <button
            onClick={() => { setActiveTab('contact'); setStatusFilter('all'); }}
            className={`flex-1 md:flex-initial px-4 py-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'contact' 
                ? 'bg-white text-blue-600 shadow-sm border border-slate-100' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Mail size={14} />
            যোগাযোগ বার্তা
            {stats.pendingContacts > 0 && (
              <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px]">{stats.pendingContacts}</span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('complaints'); setStatusFilter('all'); }}
            className={`flex-1 md:flex-initial px-4 py-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'complaints' 
                ? 'bg-white text-rose-600 shadow-sm border border-slate-100' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <AlertCircle size={14} />
            অভিযোগ
            {stats.pendingComplaints > 0 && (
              <span className="w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[9px]">{stats.pendingComplaints}</span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('suggestions'); setStatusFilter('all'); }}
            className={`flex-1 md:flex-initial px-4 py-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'suggestions' 
                ? 'bg-white text-amber-600 shadow-sm border border-slate-100' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Sparkles size={14} />
            পরামর্শ
            {stats.pendingSuggestions > 0 && (
              <span className="w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[9px]">{stats.pendingSuggestions}</span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('feedback'); setStatusFilter('all'); }}
            className={`flex-1 md:flex-initial px-4 py-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'feedback' 
                ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <MessageSquare size={14} />
            ফিডব্যাক
          </button>
        </div>

        {/* Toolbar (Search & Filter) */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center bg-white">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, ফোন বা বিবরণ দিয়ে খুঁজুন..."
              className="w-full bg-slate-50 border border-slate-200 rounded-[12px] pl-9 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {activeTab !== 'feedback' && (
            <div className="flex items-center gap-1.5 w-full md:w-auto shrink-0">
              <Filter size={14} className="text-slate-400" />
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-[12px] px-3 py-2 text-xs font-black text-slate-600 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all w-full md:w-auto"
              >
                <option value="all">সকল অবস্থা (All Status)</option>
                <option value="pending">পেন্ডিং (Pending)</option>
                {activeTab === 'contact' ? (
                  <>
                    <option value="replied">উত্তর দেয়া হয়েছে (Replied)</option>
                    <option value="resolved">সমাধানকৃত (Resolved)</option>
                  </>
                ) : (
                  <>
                    <option value="verified">যাচাইকৃত (Verified)</option>
                    <option value="processing">চলমান (Processing)</option>
                    <option value="resolved">সমাধানকৃত (Resolved)</option>
                    <option value="rejected">বাতিলকৃত (Rejected)</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>

        {/* Table/List View */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
              <p className="text-xs font-bold">লোড হচ্ছে...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 bg-slate-50/20 text-center p-4">
              <Info size={36} className="text-slate-300 mb-2" />
              <p className="text-sm font-black text-slate-600">কোনো তথ্য পাওয়া যায়নি</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">এই ট্যাবে বা ফিল্টারের অধীনে বর্তমানে কোনো সাবমিশন রেকর্ড নেই।</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-4 text-[11px] font-black text-slate-400 tracking-wider">প্রেরক ও যোগাযোগ</th>
                  <th className="p-4 text-[11px] font-black text-slate-400 tracking-wider">মূল বিষয় / রেটিং</th>
                  <th className="p-4 text-[11px] font-black text-slate-400 tracking-wider">সংক্ষিপ্ত বার্তা</th>
                  <th className="p-4 text-[11px] font-black text-slate-400 tracking-wider">তারিখ</th>
                  {activeTab !== 'feedback' && <th className="p-4 text-[11px] font-black text-slate-400 tracking-wider">অবস্থা</th>}
                  <th className="p-4 text-[11px] font-black text-slate-400 tracking-wider text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => {
                  const name = item.name || item.complainantName || "বেনামী ব্যবহারকারী";
                  const phone = item.phone || item.complainantPhone || "প্রদান করা হয়নি";
                  const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('bn-BD') : "জানা নেই";
                  
                  // Extract preview msg
                  const message = item.message || item.description || "";
                  const previewMessage = message.length > 50 ? message.slice(0, 50) + "..." : message;

                  // Extract title/subject
                  const subject = item.subject || item.title || "কোনো বিষয় নেই";

                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      
                      {/* User Info */}
                      <td className="p-4">
                        <div>
                          <p className="text-xs font-black text-slate-800">{name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{phone}</p>
                          {item.email && <p className="text-[9px] font-bold text-[#009664]">{item.email}</p>}
                        </div>
                      </td>

                      {/* Subject / Rating */}
                      <td className="p-4">
                        {activeTab === 'feedback' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-amber-500">★ {item.rating || 5}</span>
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md">রেটিং</span>
                          </div>
                        ) : (
                          <p className="text-xs font-black text-slate-700">{subject}</p>
                        )}
                      </td>

                      {/* Message Preview */}
                      <td className="p-4">
                        <p className="text-xs font-bold text-slate-500 max-w-xs truncate">{previewMessage}</p>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-xs font-bold text-slate-500">
                        {date}
                      </td>

                      {/* Status badge (Except feedback) */}
                      {activeTab !== 'feedback' && (
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                            item.status === 'Pending' || !item.status ? 'bg-amber-50 text-amber-600' :
                            item.status === 'Verified' ? 'bg-blue-50 text-blue-600' :
                            item.status === 'Processing' ? 'bg-indigo-50 text-indigo-600' :
                            item.status === 'Resolved' || item.status === 'Replied' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {item.status === 'Pending' || !item.status ? 'পেন্ডিং' :
                             item.status === 'Verified' ? 'যাচাইকৃত' :
                             item.status === 'Processing' ? 'চলমান' :
                             item.status === 'Resolved' || item.status === 'Replied' ? 'সমাধানকৃত' :
                             'বাতিলকৃত'}
                          </span>
                        </td>
                      )}

                      {/* Action buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetails(item)}
                            className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, activeTab)}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Details & Action Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]"
            >
              
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeTab === 'contact' ? 'bg-blue-50 text-blue-600' :
                    activeTab === 'complaints' ? 'bg-rose-50 text-rose-600' :
                    activeTab === 'suggestions' ? 'bg-amber-50 text-amber-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {activeTab === 'contact' ? <Mail size={16} /> :
                     activeTab === 'complaints' ? <AlertCircle size={16} /> :
                     activeTab === 'suggestions' ? <Sparkles size={16} /> :
                     <MessageSquare size={16} />}
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800">
                      {activeTab === 'contact' ? "যোগাযোগ বার্তার বিবরণ" :
                       activeTab === 'complaints' ? "অভিযোগের বিবরণ" :
                       activeTab === 'suggestions' ? "পরামর্শের বিবরণ" :
                       "ফিডব্যাকের বিবরণ"}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400">ID: {selectedItem.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center transition-all"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                
                {/* Meta details */}
                <div className="bg-slate-50 p-4 rounded-[16px] border border-slate-100/80 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[10px] font-black text-slate-400">প্রেরকের নাম</p>
                    <p className="font-black text-slate-800 mt-0.5">{selectedItem.name || selectedItem.complainantName || "বেনামী ব্যবহারকারী"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400">মোবাইল নম্বর</p>
                    <p className="font-black text-slate-800 mt-0.5">{selectedItem.phone || selectedItem.complainantPhone || "প্রদান করা হয়নি"}</p>
                  </div>
                  {selectedItem.email && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400">ইমেইল ঠিকানা</p>
                      <p className="font-black text-[#009664] mt-0.5">{selectedItem.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-black text-slate-400">তারিখ ও সময়</p>
                    <p className="font-black text-slate-800 mt-0.5">
                      {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString('bn-BD') : "জানা নেই"}
                    </p>
                  </div>
                  {selectedItem.unionName && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400">ইউনিয়ন</p>
                      <p className="font-black text-slate-800 mt-0.5">{selectedItem.unionName}</p>
                    </div>
                  )}
                  {activeTab === 'feedback' && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400">নাগরিক রেটিং</p>
                      <p className="font-black text-amber-500 mt-0.5">★ {selectedItem.rating || 5} / ৫</p>
                    </div>
                  )}
                </div>

                {/* Subject & Message Content */}
                <div className="space-y-1.5">
                  {(selectedItem.subject || selectedItem.title) && (
                    <div className="bg-emerald-50/30 p-3 rounded-lg border border-emerald-100/50">
                      <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">বিষয় / শিরোনাম</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{selectedItem.subject || selectedItem.title}</p>
                    </div>
                  )}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400">বার্তার বিবরণ</p>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed mt-1 whitespace-pre-wrap">
                      {selectedItem.message || selectedItem.description}
                    </p>
                  </div>
                </div>

                {/* Display Action logs for complaints/suggestions */}
                {(activeTab === 'complaints' || activeTab === 'suggestions') && selectedItem.actionLog && selectedItem.actionLog.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      কার্যক্রম লগ (Action Log)
                    </p>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 max-h-32 overflow-y-auto">
                      {selectedItem.actionLog.map((log: any, idx: number) => (
                        <div key={idx} className="flex gap-2 text-[11px] border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                          <CornerDownRight size={12} className="text-slate-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-bold text-slate-600">{log.message}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{log.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display Admin Notes for contact messages */}
                {activeTab === 'contact' && selectedItem.adminNotes && (
                  <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-3 text-xs">
                    <p className="text-[10px] font-black text-blue-800">অ্যাডমিন নোটস / উত্তর</p>
                    <p className="font-bold text-slate-700 mt-1">{selectedItem.adminNotes}</p>
                  </div>
                )}

                {/* Admin Response Action Form */}
                {activeTab !== 'feedback' && (
                  <form onSubmit={handleUpdateAction} className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-xs font-black text-slate-800">অ্যাকশন ও সমাধান আপডেট</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">অবস্থা পরিবর্তন (Status)</label>
                        <select
                          value={newStatus || ""}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-[10px] p-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Pending">পেন্ডিং (Pending)</option>
                          {activeTab === 'contact' ? (
                            <>
                              <option value="Replied">উত্তর দেওয়া হয়েছে (Replied)</option>
                              <option value="Resolved">সমাধানকৃত (Resolved)</option>
                            </>
                          ) : (
                            <>
                              <option value="Verified">যাচাইকৃত (Verified)</option>
                              <option value="Processing">চলমান (Processing)</option>
                              <option value="Resolved">সমাধানকৃত (Resolved)</option>
                              <option value="Rejected">বাতিলকৃত (Rejected)</option>
                            </>
                          )}
                        </select>
                      </div>
                      
                      <div className="flex items-end justify-end">
                        <button
                          type="submit"
                          disabled={submittingAction}
                          className="w-full py-2 bg-[#009664] hover:bg-emerald-700 disabled:opacity-50 text-white rounded-[10px] text-xs font-black flex items-center justify-center gap-1"
                        >
                          {submittingAction && <Loader2 size={12} className="animate-spin" />}
                          সংরক্ষণ করুন
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">
                        {activeTab === 'contact' ? "উত্তর / নোট লিখুন" : "কার্যক্রম বিবরণ (অ্যাকশন লগ-এ যুক্ত হবে)"}
                      </label>
                      <textarea
                        value={adminNoteInput || ""}
                        onChange={(e) => setAdminNoteInput(e.target.value)}
                        placeholder={activeTab === 'contact' ? "প্রেরকের জন্য উত্তর বা অভ্যন্তরীণ নোট..." : "অভিযোগের বিপরীতে কী পদক্ষেপ নেওয়া হয়েছে তা লিখুন..."}
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-[10px] p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 resize-none"
                      ></textarea>
                    </div>
                  </form>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedItem.id, activeTab)}
                  className="px-3 py-2 text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-[10px] transition-all flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  মুছে ফেলুন
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-xs font-black text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-[10px] transition-all"
                >
                  বন্ধ করুন
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

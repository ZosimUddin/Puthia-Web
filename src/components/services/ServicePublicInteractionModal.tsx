import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, PlusCircle, Edit3, AlertTriangle, CheckCircle2, 
  Send, Phone, MapPin, FileText, Info, ShieldAlert, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { upazilaServicesService, UpazilaService } from '../../services/upazilaServicesService';

interface ServicePublicInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: UpazilaService | null;
  initialMode?: 'add' | 'edit' | 'report';
}

export default function ServicePublicInteractionModal({
  isOpen,
  onClose,
  service,
  initialMode = 'add'
}: ServicePublicInteractionModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'add' | 'edit' | 'report'>(initialMode);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  // 1. Add Entry Form
  const [addForm, setAddForm] = useState({
    itemTitle: '',
    contactNumber: '',
    address: '',
    description: '',
    documentsOrLink: '',
    submittedByName: user?.displayName || '',
    submittedByPhone: ''
  });

  // 2. Edit Request Form
  const [editForm, setEditForm] = useState({
    proposedTitle: service?.title || '',
    proposedHelpline: service?.helpline || '',
    proposedDetails: service?.description || '',
    editReason: '',
    submittedByName: user?.displayName || '',
    submittedByPhone: ''
  });

  // 3. Report Form
  const [reportForm, setReportForm] = useState({
    reportReason: 'wrong_number',
    details: '',
    reporterName: user?.displayName || '',
    reporterPhone: ''
  });

  if (!isOpen || !service) return null;

  // Handle Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.itemTitle.trim() || !addForm.contactNumber.trim()) {
      toast.error('দয়া করে নাম এবং যোগাযোগ নম্বর প্রদান করুন');
      return;
    }

    setSubmitting(true);
    try {
      await upazilaServicesService.submitNewEntry({
        serviceId: service.id,
        serviceTitle: service.title,
        itemTitle: addForm.itemTitle.trim(),
        category: service.category || 'general',
        contactNumber: addForm.contactNumber.trim(),
        address: addForm.address.trim(),
        description: addForm.description.trim(),
        documentsOrLink: addForm.documentsOrLink.trim(),
        submittedByUid: user?.uid || 'anonymous',
        submittedByName: addForm.submittedByName || 'নাগরিক',
        submittedByPhone: addForm.submittedByPhone || ''
      });

      toast.success('আপনার আবেদনটি সুপার এডমিন মডারেশন প্যানেলে প্রেরিত হয়েছে!');
      onClose();
    } catch (err) {
      console.error('Error submitting service entry:', err);
      toast.error('আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.editReason.trim()) {
      toast.error('দয়া করে সংশোধনের কারণ উল্লেখ করুন');
      return;
    }

    setSubmitting(true);
    try {
      await upazilaServicesService.submitEditRequest({
        serviceId: service.id,
        serviceTitle: service.title,
        currentTitle: service.title,
        proposedTitle: editForm.proposedTitle.trim(),
        currentHelpline: service.helpline,
        proposedHelpline: editForm.proposedHelpline.trim(),
        currentDetails: service.description,
        proposedDetails: editForm.proposedDetails.trim(),
        editReason: editForm.editReason.trim(),
        submittedByUid: user?.uid || 'anonymous',
        submittedByName: editForm.submittedByName || 'নাগরিক',
        submittedByPhone: editForm.submittedByPhone || ''
      });

      toast.success('সংশোধনের প্রস্তাবটি সফলভাবে সুপার এডমিনে পাঠানো হয়েছে!');
      onClose();
    } catch (err) {
      console.error('Error submitting edit request:', err);
      toast.error('আবেদন জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Report Submit
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.details.trim()) {
      toast.error('দয়া করে রিপোর্টের বিবরণ সংক্ষেপে লিখুন');
      return;
    }

    setSubmitting(true);
    try {
      await upazilaServicesService.submitReport({
        serviceId: service.id,
        serviceTitle: service.title,
        reportReason: reportForm.reportReason,
        details: reportForm.details.trim(),
        reporterUid: user?.uid || 'anonymous',
        reporterName: reportForm.reporterName || 'নাগরিক',
        reporterPhone: reportForm.reporterPhone || ''
      });

      toast.success('আপনার রিপোর্টটি নিবন্ধিত হয়েছে। সুপার এডমিন অতিসত্বর খতিয়ে দেখবেন।');
      onClose();
    } catch (err) {
      console.error('Error submitting report:', err);
      toast.error('রিপোর্ট জমা দিতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8 space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">{service.icon}</span>
              <div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase">
                  {service.category || 'সেবা'}
                </span>
                <h3 className="text-lg font-black text-slate-900">{service.title}</h3>
                <p className="text-xs font-bold text-slate-500">উপজেলা ৬৩টি ডিজিটাল নাগরিক সেবা তথ্য</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 border-none bg-transparent cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Action Tabs */}
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'add' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle size={14} />
              <span>নতুন তথ্য এড করুন</span>
            </button>

            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'edit' ? 'bg-white text-indigo-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 size={14} />
              <span>এডিট / সংশোধন</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'report' ? 'bg-white text-rose-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle size={14} />
              <span>রিপোর্ট করুন</span>
            </button>
          </div>

          {/* Form Content */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 font-medium">
                <Sparkles size={16} className="text-emerald-600 shrink-0" />
                <span>আপনার জমা দেওয়া তথ্য সুপার এডমিন যাচাইয়ের পর সরাসরি লাইভ তালিকায় যুক্ত হবে।</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    প্রতিষ্ঠানের নাম / সেবার শিরোনাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: পুঠিয়া ডিজিটাল ডায়াগনস্টিক সেন্টার"
                    value={addForm.itemTitle}
                    onChange={(e) => setAddForm({ ...addForm, itemTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মোবাইল / হেল্পলাইন নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: 01700000000"
                      value={addForm.contactNumber}
                      onChange={(e) => setAddForm({ ...addForm, contactNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ঠিকানা / লোকেশন</label>
                    <input
                      type="text"
                      placeholder="যেমন: পুঠিয়া বাজার, মডেল থানা মোড়"
                      value={addForm.address}
                      onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">সেবার বিবরণ / সার্ভিস তালিকা</label>
                  <textarea
                    rows={2}
                    placeholder="সেবাটি সম্পর্কিত প্রয়োজনীয় বিবরণ লিখুন..."
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">আপনার নাম</label>
                    <input
                      type="text"
                      placeholder="আপনার নাম"
                      value={addForm.submittedByName}
                      onChange={(e) => setAddForm({ ...addForm, submittedByName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">আপনার ফোন নম্বর</label>
                    <input
                      type="text"
                      placeholder="যোগাযোগের নম্বর"
                      value={addForm.submittedByPhone}
                      onChange={(e) => setAddForm({ ...addForm, submittedByPhone: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border-none cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-2.5 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white border-none cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>{submitting ? 'জমা দেওয়া হচ্ছে...' : 'তথ্য সাবমিট করুন'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Edit Form */}
          {activeTab === 'edit' && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 flex items-center gap-2 font-medium">
                <Info size={16} className="text-indigo-600 shrink-0" />
                <span>বিদ্যমান তথ্য সংশোধনের জন্য সঠিক তথ্য এবং কারণ উল্লেখ করে আবেদন পাঠান।</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">প্রস্তাবিত শিরোনাম</label>
                  <input
                    type="text"
                    value={editForm.proposedTitle}
                    onChange={(e) => setEditForm({ ...editForm, proposedTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">প্রস্তাবিত হেল্পলাইন / নম্বর</label>
                  <input
                    type="text"
                    value={editForm.proposedHelpline}
                    onChange={(e) => setEditForm({ ...editForm, proposedHelpline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সংশোধনের কারণ <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="কেন এই সংশোধন প্রয়োজন উল্লেখ করুন (যেমন: নম্বর পরিবর্তন হয়েছে, নাম ভুল ইত্যাদি)..."
                    value={editForm.editReason}
                    onChange={(e) => setEditForm({ ...editForm, editReason: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border-none cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-2.5 rounded-xl text-xs font-black bg-indigo-700 hover:bg-indigo-800 text-white border-none cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>{submitting ? 'জমা দেওয়া হচ্ছে...' : 'এডিট রিকোয়েস্ট পাঠান'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Report Form */}
          {activeTab === 'report' && (
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-2xl text-xs text-rose-900 flex items-center gap-2 font-medium">
                <ShieldAlert size={16} className="text-rose-600 shrink-0" />
                <span>ভুল বা বিভ্রান্তিকর তথ্য সুপার এডমিনকে রিপোর্ট করুন। অভিযোগ দ্রুত খতিয়ে দেখা হবে।</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অভিযোগের ধরন</label>
                  <select
                    value={reportForm.reportReason}
                    onChange={(e) => setReportForm({ ...reportForm, reportReason: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="wrong_number">ভুল বা বন্ধ মোবাইল নম্বর</option>
                    <option value="service_closed">সেবা কেন্দ্রটি বর্তমানে বন্ধ</option>
                    <option value="fake_info">ভুয়া বা বিভ্রান্তিকর তথ্য</option>
                    <option value="harassment">হয়রানি বা অতিরিক্ত ফি দাবি</option>
                    <option value="other">অন্যান্য সমস্যা</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অভিযোগের বিস্তারিত বিবরণ <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="সমস্যাটির বিস্তারিত ব্যাখ্যা লিখুন..."
                    value={reportForm.details}
                    onChange={(e) => setReportForm({ ...reportForm, details: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border-none cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-2.5 rounded-xl text-xs font-black bg-rose-700 hover:bg-rose-800 text-white border-none cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>{submitting ? 'জমা দেওয়া হচ্ছে...' : 'অভিযোগ জমা দিন'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

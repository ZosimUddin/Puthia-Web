import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Search, 
  ExternalLink, 
  RotateCcw, 
  ShieldAlert, 
  ChevronRight,
  FileText,
  HelpCircle,
  Copy,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { UserReport, ReportStatus, Appeal } from '../../types/moderation';
import { getUserSubmittedReports, submitAppeal } from '../../services/moderationService';
import { toast } from 'sonner';

interface UserReportTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserReportTrackerModal: React.FC<UserReportTrackerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user, userProfile } = useAuth();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);

  // Appeal flow inside tracker
  const [isAppealOpen, setIsAppealOpen] = useState(false);
  const [appealStatement, setAppealStatement] = useState('');
  const [appealEvidenceUrl, setAppealEvidenceUrl] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadReports();
    }
  }, [isOpen, user]);

  const loadReports = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const list = await getUserSubmittedReports(user.uid);
      setReports(list);
    } catch (err) {
      console.error('Error loading reports:', err);
      toast.error('রিপোর্ট ট্র্যাকিং তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    if (!appealStatement.trim()) {
      toast.error('দয়া করে আপনার আপিলের বিস্তারিত বক্তব্য লিখুন');
      return;
    }

    setIsSubmittingAppeal(true);
    try {
      await submitAppeal({
        caseId: selectedReport.caseId || selectedReport.ticketId,
        ticketId: selectedReport.ticketId,
        targetType: 'content',
        targetId: selectedReport.contentId,
        userUid: user?.uid || '',
        userName: userProfile?.name || user?.displayName || 'ব্যবহারকারী',
        userEmail: user?.email || '',
        userPhone: userProfile?.phone || '',
        appealStatement: appealStatement.trim(),
        evidenceUrl: appealEvidenceUrl.trim(),
        originalAction: selectedReport.actionTaken || 'Review Outcome',
        originalReason: selectedReport.reasonLabel
      });

      toast.success('আপনার আপিল সফলভাবে জমা হয়েছে। সেকেন্ড-লেভেল টিম এটি পর্যালোচনা করবে।');
      setIsAppealOpen(false);
      setAppealStatement('');
      setAppealEvidenceUrl('');
      loadReports();
    } catch (err: any) {
      console.error('Error submitting appeal:', err);
      toast.error('আপিল জমা দিতে সমস্যা হয়েছে');
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  if (!isOpen) return null;

  const filteredReports = reports.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.ticketId.toLowerCase().includes(q) ||
      r.reasonLabel.toLowerCase().includes(q) ||
      (r.contentTitle || '').toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
            <Clock size={11} /> জমা দেওয়া হয়েছে
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
            <Clock size={11} /> যাচাই চলছে
          </span>
        );
      case 'action_taken':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle2 size={11} /> ব্যবস্থা নেওয়া হয়েছে
          </span>
        );
      case 'no_violation':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
            <AlertCircle size={11} /> কোনো লঙ্ঘন পাওয়া যায়নি
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
            <CheckCircle2 size={11} /> সমাধান সম্পন্ন
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm font-sans text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Clock size={20} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  আমার দাখিলকৃত রিপোর্ট ট্র্যাকার
                </h3>
                <p className="text-[11px] text-slate-300 font-medium">
                  আপনার জমা দেওয়া সকল অভিযোগ ও পদক্ষেপের রিয়েল-টাইম স্ট্যাটাস
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="টিকিট নম্বর বা কারণ দিয়ে খুঁজুন..."
                className="w-full text-xs bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 font-medium"
              />
            </div>
          </div>

          {/* Body List */}
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-3">
            {loading ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold">রিপোর্ট রেকর্ড লোড হচ্ছে...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2 bg-slate-50 rounded-2xl p-6">
                <FileText size={36} className="mx-auto text-slate-300" />
                <h4 className="text-sm font-black text-slate-700">কোনো রিপোর্ট পাওয়া যায়নি</h4>
                <p className="text-xs font-medium text-slate-400 max-w-xs mx-auto">
                  আপনার অ্যাকাউন্টের মাধ্যমে পূর্বে কোনো রিপোর্ট দাখিল করা হয়ে থাকলে তা এখানে প্রদর্শিত হবে।
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-black text-rose-700">
                      #{report.ticketId}
                    </span>
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="text-xs font-bold text-slate-900 line-clamp-1">
                    {report.contentTitle || `${report.contentType} #${report.contentId.slice(0, 8)}`}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                    <span className="text-rose-600 font-bold">
                      কারণ: {report.reasonLabel}
                    </span>
                    <span>
                      {new Date(report.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>

                  {report.resolutionNote && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700 font-medium">
                      <span className="font-bold text-slate-900 block mb-0.5">মডারেশন সিদ্ধান্ত:</span>
                      {report.resolutionNote}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Selected Report Detail / Appeal Drawer */}
          {selectedReport && isAppealOpen && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <RotateCcw size={14} className="text-amber-600" />
                  সিদ্ধান্ত পুনর্বিবেচনার আবেদন (Appeal)
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAppealOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  বাতিল
                </button>
              </div>

              <form onSubmit={handleAppealSubmit} className="space-y-2 text-xs">
                <textarea
                  rows={3}
                  value={appealStatement}
                  onChange={(e) => setAppealStatement(e.target.value)}
                  placeholder="কেন আপনি মনে করেন এই মডারেশন সিদ্ধান্তটি পরিবর্তন করা উচিত? বিস্তারিত লিখুন..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 font-medium resize-none"
                />
                <input
                  type="url"
                  value={appealEvidenceUrl}
                  onChange={(e) => setAppealEvidenceUrl(e.target.value)}
                  placeholder="কোনো প্রমাণের লিংক (ঐচ্ছিক)"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-medium"
                />
                <button
                  type="submit"
                  disabled={isSubmittingAppeal}
                  className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send size={12} /> আপিল দাখিল করুন
                </button>
              </form>
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-medium">
              মোট রিপোর্ট: <strong className="text-slate-800">{reports.length}টি</strong>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

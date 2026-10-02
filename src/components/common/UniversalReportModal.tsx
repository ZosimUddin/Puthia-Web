import React, { useState, useEffect, useMemo } from "react";
import { 
  ShieldAlert, 
  X, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Phone, 
  User, 
  Link as LinkIcon,
  HelpCircle,
  Flag,
  Lock,
  ChevronRight,
  ArrowLeft,
  Copy,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { 
  ReportableContentType, 
  ReportCategory, 
  ContentHierarchyContext 
} from "../../types/moderation";
import { 
  REPORT_CATEGORIES, 
  ALL_REPORT_REASONS, 
  getReasonsForContentType 
} from "../../data/reportReasons";
import { submitUserReport } from "../../services/moderationService";

export interface ReportTarget {
  contentId: string;
  contentType: ReportableContentType | string; // e.g. "post", "comment", "reply", "profile", "page", "group", "story", "reel", "video", "live", "marketplace", "event", "message", etc.
  contentTitle: string;
  contentSnippet?: string;
  contentOwnerId?: string;
  contentOwnerName?: string;
  contentOwnerAvatar?: string;
  mediaUrls?: string[];
  pageUrl?: string;
  targetCollection?: string;
  context?: ContentHierarchyContext;
}

interface UniversalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ReportTarget | null;
  onOpenTracker?: () => void;
}

export const UniversalReportModal: React.FC<UniversalReportModalProps> = ({
  isOpen,
  onClose,
  target,
  onOpenTracker
}) => {
  const { user, userProfile } = useAuth();

  // Multi-step wizard
  // Step 1: Select Category
  // Step 2: Select Specific Reason within Category
  // Step 3: Additional Details & Proof (Optional/Required)
  // Step 4: Confirmation with Ticket ID
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [selectedReasonId, setSelectedReasonId] = useState<string>("");
  const [details, setDetails] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterName, setReporterName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState<string>("");
  const [copiedTicket, setCopiedTicket] = useState(false);

  const normalizedContentType: ReportableContentType = useMemo(() => {
    if (!target) return 'post';
    const type = target.contentType.toLowerCase() as ReportableContentType;
    const validTypes: ReportableContentType[] = [
      'post', 'comment', 'reply', 'profile', 'page', 'group', 
      'story', 'reel', 'video', 'live', 'marketplace', 'event', 'message'
    ];
    return validTypes.includes(type) ? type : 'post';
  }, [target]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedCategory(null);
      setSelectedReasonId("");
      setDetails("");
      setProofUrl("");
      setGeneratedTicketId("");
      setCopiedTicket(false);
      setReporterPhone(userProfile?.phone || "");
      setReporterName(userProfile?.name || user?.displayName || "");
    }
  }, [isOpen, user, userProfile]);

  // Dynamic reasons filtered by normalized content type and selected category
  const availableReasons = useMemo(() => {
    const reasonsForType = getReasonsForContentType(normalizedContentType);
    if (!selectedCategory) return reasonsForType;
    return reasonsForType.filter(r => r.category === selectedCategory);
  }, [normalizedContentType, selectedCategory]);

  const selectedReasonObj = useMemo(() => {
    return ALL_REPORT_REASONS.find(r => r.id === selectedReasonId);
  }, [selectedReasonId]);

  if (!isOpen || !target) return null;

  const handleCategorySelect = (catId: ReportCategory) => {
    setSelectedCategory(catId);
    setStep(2);
  };

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReasonId(reasonId);
    const reason = ALL_REPORT_REASONS.find(r => r.id === reasonId);
    if (reason?.detailsRequired) {
      setStep(3);
    } else {
      setStep(3); // Proceed to optional review & details
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReasonId) {
      toast.error("দয়া করে একটি নির্দিষ্ট কারণ নির্বাচন করুন");
      return;
    }

    if (selectedReasonObj?.detailsRequired && !details.trim()) {
      toast.error("এই বিষয়ের জন্য অতিরিক্ত বিবরণ আবশ্যক। দয়া করে বিস্তারিত লিখুন।");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitUserReport({
        contentId: target.contentId,
        contentType: normalizedContentType,
        contentTitle: target.contentTitle,
        contentSnippet: target.contentSnippet,
        contentUrl: target.pageUrl || window.location.href,
        mediaUrls: target.mediaUrls,
        contentAuthorUid: target.contentOwnerId,
        contentAuthorName: target.contentOwnerName,
        context: target.context,

        reasonId: selectedReasonId,
        details: details.trim(),
        proofUrl: proofUrl.trim(),

        reporterUid: user?.uid || "guest",
        reporterName: reporterName.trim() || "সাধারণ নাগরিক",
        reporterAvatar: (userProfile as any)?.avatar || userProfile?.photoURL || user?.photoURL || "",
        reporterPhone: reporterPhone.trim(),
        reporterEmail: user?.email || ""
      });

      setGeneratedTicketId(res.ticketId);
      setStep(4);
      toast.success(res.message);
    } catch (err: any) {
      console.error("Error submitting report:", err);
      toast.error(err.message || "রিপোর্ট জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (!generatedTicketId) return;
    navigator.clipboard.writeText(generatedTicketId);
    setCopiedTicket(true);
    toast.success("রিপোর্ট টিকিট নম্বর কপি করা হয়েছে!");
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  const contentTypeBadgeTitle = (type: ReportableContentType) => {
    switch (type) {
      case 'post': return '📝 পোস্ট';
      case 'comment': return '💬 কমেন্ট';
      case 'reply': return '↩️ রিপ্লাই';
      case 'profile': return '👤 প্রোফাইল';
      case 'page': return '📄 পেজ';
      case 'group': return '👥 গ্রুপ';
      case 'story': return '📸 স্টোরি';
      case 'reel': return '🎬 রিল';
      case 'video': return '🎥 ভিডিও';
      case 'live': return '🔴 লাইভ স্ট্রিম';
      case 'marketplace': return '🛒 মার্কেটপ্লেস পণ্য';
      case 'event': return '📅 ইভেন্ট';
      case 'message': return '✉️ মেসেজ';
      default: return '🛡️ কনটেন্ট';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm font-sans text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Flag size={20} className="text-white fill-white/20" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  অভিযোগ ও রিপোর্ট দাখিল
                </h3>
                <p className="text-[11px] text-rose-100 font-medium">
                  {contentTypeBadgeTitle(normalizedContentType)} • নিরাপদ পুঠিয়া কমিউনিটি
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Target Content Snippet Preview */}
          <div className="bg-slate-50 border-b border-slate-100 p-3.5 px-5 flex items-center justify-between gap-3 text-xs">
            <div className="truncate flex-1">
              <span className="font-black text-slate-500 uppercase text-[10px] block">অভিযুক্ত বিষয়বস্তু</span>
              <p className="font-bold text-slate-800 truncate">
                {target.contentTitle || target.contentSnippet || `${normalizedContentType} #${target.contentId.slice(0, 8)}`}
              </p>
            </div>
            {target.contentOwnerName && (
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 shrink-0 flex items-center gap-1">
                <User size={11} className="text-slate-400" /> {target.contentOwnerName}
              </span>
            )}
          </div>

          {/* Stepper Wizard Body */}
          <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
            
            {/* STEP 1: Select Category */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">
                    কেন আপনি এই বিষয়বস্তুটি রিপোর্ট করছেন?
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    সঠিক ক্যাটাগরি নির্বাচন করুন যাতে মডারেটর টিম দ্রুত ব্যবস্থা নিতে পারে:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {REPORT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className="w-full p-3.5 rounded-2xl border border-slate-100 bg-white hover:border-rose-400 hover:shadow-md hover:bg-rose-50/20 transition-all flex items-center justify-between group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat.bnName.split(' ')[0]}</span>
                        <div>
                          <p className="text-xs font-black text-slate-800 group-hover:text-rose-700 transition-colors">
                            {cat.bnName.substring(cat.bnName.indexOf(' ') + 1)}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-rose-600 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Select Specific Reason */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft size={14} /> পেছনে যান
                  </button>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-600">
                    ধাপ ২/৩
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">
                    সুনির্দিষ্ট কারণ নির্বাচন করুন
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    কোন বিষয়ের কারণে এটি পুঠিয়া প্ল্যাটফর্মের কমিউনিটি নীতি পরিপন্থি:
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  {availableReasons.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl text-xs font-medium">
                      এই ক্যাটাগরির কোনো কারণ পাওয়া যায়নি। অন্যান্য নীতি লঙ্ঘন সিলেক্ট করুন।
                    </div>
                  ) : (
                    availableReasons.map((reason) => (
                      <button
                        key={reason.id}
                        type="button"
                        onClick={() => handleReasonSelect(reason.id)}
                        className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-start gap-3 cursor-pointer ${
                          selectedReasonId === reason.id 
                            ? "bg-rose-50 border-rose-400 shadow-xs"
                            : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <span className="text-lg shrink-0 mt-0.5">{reason.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black text-slate-900">
                              {reason.bnLabel}
                            </p>
                            {reason.severity === 'critical' && (
                              <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded text-[9px] font-black uppercase">
                                জরুরী
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {reason.description}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Details & Confirmation Submit Form */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft size={14} /> কারণ পরিবর্তন
                  </button>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-600">
                    ধাপ ৩/৩
                  </span>
                </div>

                {/* Selected Reason summary banner */}
                {selectedReasonObj && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
                    <span className="text-2xl">{selectedReasonObj.icon}</span>
                    <div>
                      <p className="text-xs font-black text-rose-900">{selectedReasonObj.bnLabel}</p>
                      <p className="text-[11px] text-rose-700/80 font-medium">{selectedReasonObj.description}</p>
                    </div>
                  </div>
                )}

                {/* Details TextArea */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-800">
                    অতিরিক্ত বিবরণ / ঘটনার প্রেক্ষাপট{" "}
                    {selectedReasonObj?.detailsRequired ? (
                      <span className="text-rose-600 font-black">* (আবশ্যক)</span>
                    ) : (
                      <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
                    )}
                  </label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="মডারেটরের বোঝার সুবিধার্থে প্রয়োজনীয় সুনির্দিষ্ট তথ্য বা প্রেক্ষাপট লিখুন..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none font-medium"
                  />
                </div>

                {/* Proof / Screenshot URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-800">
                    প্রমাণ বা লিংক (যদি থাকে) <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      placeholder="https://imgur.com/... বা কোনো প্রমাণপত্রের লিংক"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-9 pr-3 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
                    />
                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Reporter Contact Info */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase block flex items-center gap-1">
                    <Lock size={10} /> রিপোর্টার পরিচিতি (গোপন রাখা হবে)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <input
                        type="text"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        placeholder="আপনার নাম"
                        className="w-full text-[11px] bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-700"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        value={reporterPhone}
                        onChange={(e) => setReporterPhone(e.target.value)}
                        placeholder="ফোন নম্বর"
                        className="w-full text-[11px] bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-700"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    আপনার পরিচয় সম্পূর্ণ সুরক্ষিত এবং অভিযুক্ত ব্যক্তি কখনই আপনার নাম দেখতে পারবে না।
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>রিপোর্ট জমা হচ্ছে...</span>
                  ) : (
                    <>
                      <Send size={14} />
                      রিপোর্ট নিশ্চিত ও সাবমিট করুন
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 4: Success & Confirmation with Ticket ID */}
            {step === 4 && (
              <div className="py-4 text-center space-y-5">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
                  <CheckCircle2 size={36} />
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-slate-900">
                    ✅ আপনার রিপোর্ট সফলভাবে গৃহীত হয়েছে!
                  </h4>
                  <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                    আমাদের মডারেশন টিম অভিযোগটি গুরুত্বের সাথে পর্যালোচনা করবে।
                  </p>
                </div>

                {/* Ticket ID Box */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">
                    আপনার রিপোর্ট ট্র্যাকিং টিকিট ID
                  </span>
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 px-4">
                    <span className="text-sm font-mono font-black text-rose-700 tracking-wider">
                      {generatedTicketId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTicket}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 text-[11px] font-bold"
                    >
                      {copiedTicket ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copiedTicket ? "কপি হয়েছে" : "কপি"}
                    </button>
                  </div>
                </div>

                {/* Status flow indicator */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">
                    রিপোর্ট পর্যালোচনা প্রক্রিয়া:
                  </span>
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-600">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black">১. জমা সম্পন্ন</span>
                    <span>→</span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded">২. যাচাইকরণ</span>
                    <span>→</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded">৩. সমাধান</span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  {onOpenTracker && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenTracker();
                      }}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
                    >
                      <Clock size={14} /> রিপোর্ট স্ট্যাটাস দেখুন
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black transition-all"
                  >
                    বন্ধ করুন
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Footer Guidelines Notice */}
          <div className="p-3 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 text-center font-medium">
            🛡️ মিথ্যা বা উদ্দেশ্যপ্রণোদিত রিপোর্ট দাখিল করা প্ল্যাটফর্ম নীতিমালার লঙ্ঘন।
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

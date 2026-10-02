import React, { useState } from "react";
import { 
  ShieldCheck, 
  X, 
  Send, 
  CheckCircle2, 
  FileText, 
  Building2, 
  Store, 
  Landmark, 
  Award, 
  UserCheck, 
  Upload, 
  Phone, 
  MapPin, 
  HelpCircle,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { VerificationType, VERIFICATION_TYPES_CONFIG } from "./VerificationBadge";

interface VerificationApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: VerificationType;
  defaultEntityName?: string;
  defaultEntityId?: string;
}

export const VerificationApplyModal: React.FC<VerificationApplyModalProps> = ({
  isOpen,
  onClose,
  defaultType = "business",
  defaultEntityName = "",
  defaultEntityId = ""
}) => {
  const { user, userProfile } = useAuth();

  const [entityType, setEntityType] = useState<VerificationType>(defaultType);
  const [entityName, setEntityName] = useState(defaultEntityName);
  const [registrationNo, setRegistrationNo] = useState("");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [address, setAddress] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!entityName.trim()) {
      toast.error("অনুগ্রহ করে প্রতিষ্ঠান বা ব্যক্তির নাম উল্লেখ করুন");
      return;
    }

    if (!phone.trim()) {
      toast.error("যোগাযোগের মোবাইল নম্বর প্রদান করুন");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        applicantUid: user?.uid || "guest",
        applicantName: userProfile?.name || user?.displayName || entityName,
        applicantEmail: user?.email || "",
        
        entityId: defaultEntityId || "",
        entityType,
        entityName: entityName.trim(),
        registrationNo: registrationNo.trim(),
        phone: phone.trim(),
        address: address.trim(),
        proofUrl: proofUrl.trim(),
        description: description.trim(),

        status: "pending", // pending, verified, rejected, correction_required
        requestedBadgeLabel: VERIFICATION_TYPES_CONFIG[entityType].label,
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, "verification_requests"), requestData);

      setIsSuccess(true);
      toast.success("ভেরিফিকেশন আবেদনটি সফলভাবে জমা দেওয়া হয়েছে!");
    } catch (err) {
      console.error("Error submitting verification request:", err);
      toast.error("আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs font-sans text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-white leading-tight flex items-center gap-1.5">
                  <span>ভেরিফাইড ব্যাজ আবেদন ফর্ম</span>
                  <Sparkles size={14} className="text-amber-300 animate-pulse" />
                </h3>
                <p className="text-[11px] text-emerald-100 font-medium">
                  বিশ্বস্ততা ও আস্থা অর্জনে ভেরিফাইড ব্যাজ পেয়ে যান
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-emerald-200 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition border-none cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {isSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-slate-900">
                    আবেদনটি সফলভাবে এডমিন টিমে পৌঁছেছে!
                  </h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    আমাদের মডারেশন ও ভেরিফিকেশন টিম তথ্য ও কাগজপত্র যাচাই করে ৪৮ ঘণ্টার মধ্যে প্রোফাইলে অফিসিয়াল ভেরিফাইড ব্যাজ অনুমোদন প্রদান করবে।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl text-xs font-black transition border-none cursor-pointer"
                >
                  ঠিক আছে, বন্ধ করুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Select Entity Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-800">
                    ভেরিফিকেশনের ধরন বা ক্যাটাগরি: *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(VERIFICATION_TYPES_CONFIG) as VerificationType[]).map((type) => {
                      const cfg = VERIFICATION_TYPES_CONFIG[type];
                      const Icon = cfg.icon;
                      const isSelected = entityType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setEntityType(type)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition text-left flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? `${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass} ring-2 ring-emerald-500/30 font-black shadow-xs`
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <Icon size={16} className="shrink-0" />
                          <span className="truncate">{cfg.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Entity Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    {entityType === "user" ? "আপনার পূর্ণ নাম:" : entityType === "professional" ? "পেশাজীবীর নাম ও ডিগ্রি:" : "প্রতিষ্ঠানের পূর্ণ নাম:"} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: পুঠিয়া রাজকীয় খাজা ঘর / ড. আনিসুর রহমান"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Registration / License Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      {entityType === "user" ? "NID / জন্ম নিবন্ধন নম্বর:" : entityType === "professional" ? "BMDC / বার কাউন্সিল / ডিগ্রি রেজি নম্বর:" : "ট্রেড লাইসেন্স / রেজি নম্বর:"}
                    </label>
                    <input
                      type="text"
                      placeholder="লাইসেন্স বা সনদ নম্বর"
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      যোগাযোগের মোবাইল নম্বর: *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="০১৭xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    ঠিকানা / অবস্থান:
                  </label>
                  <input
                    type="text"
                    placeholder="রাজবাড়ী রোড, পুঠিয়া, রাজশাহী"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Proof Document URL */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>প্রমাণপত্র/লাইসেন্সের ছবি বা গুগল ড্রাইভ লিংক:</span>
                    <span className="text-[10px] text-slate-400 font-normal">(ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    অতিরিক্ত নোট বা তথ্য:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="কেন আপনাকে ভেরিফাইড ব্যাজ প্রদান করা উচিত, সংক্ষেপে লিখুন..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600 resize-none"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-[11px] text-emerald-950 space-y-0.5">
                  <p className="font-bold flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                    <span>ভেরিফিকেশন সুবিধা:</span>
                  </p>
                  <p className="text-emerald-800 leading-tight">
                    ভেরিফাইড ব্যাজ যুক্ত হলে নাগরিকরা সার্চ ফলাফলে আপনার তথ্যকে ১ নম্বরে পাবেন এবং আপনার বিশ্বস্ততা বহুগুণ বৃদ্ধি পাবে।
                  </p>
                </div>

                {/* Submit Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border-none cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-[#006a4e] hover:bg-[#00543e] disabled:bg-slate-300 text-white rounded-xl text-xs font-black transition border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VerificationApplyModal;

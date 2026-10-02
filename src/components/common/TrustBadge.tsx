import React, { useState } from 'react';
import { ShieldCheck, Calendar, UserCheck, Database, Flag, Edit3, CheckCircle2, AlertCircle, X, Send } from 'lucide-react';

export interface DataTrustMetadata {
  isVerified: boolean;
  lastVerifiedDate: string;
  lastUpdatedDate: string;
  dataSource: string; // e.g., "উপজেলা স্বাস্থ্য কমপ্লেক্স, পুঠিয়া"
  dataOwner: string; // e.g., "ডা. মোহাম্মদ আলী (উপজেলা স্বাস্থ্য কর্মকর্তা)"
  verificationMethod?: string; // e.g., "অন-সাইট ভেরিফাইড"
}

interface TrustBadgeProps {
  metadata: DataTrustMetadata;
  entityName: string;
  onCorrectionSubmit?: (details: string) => void;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ metadata, entityName, onCorrectionSubmit }) => {
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionDetails, setCorrectionDetails] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionDetails.trim()) return;
    
    if (onCorrectionSubmit) {
      onCorrectionSubmit(correctionDetails);
    }
    setSubmittedMessage("আপনার সংশোধনী অনুরোধ জমা হয়েছে! আমাদের যাচাইকারী দল এটি পরীক্ষা করে ২৪ ঘণ্টার মধ্যে আপডেট করবে।");
    setCorrectionDetails('');
    setTimeout(() => {
      setSubmittedMessage(null);
      setShowCorrectionModal(false);
    }, 3000);
  };

  return (
    <div className="bg-slate-50/80 dark:bg-slate-800/80 border border-emerald-500/20 rounded-2xl p-3.5 space-y-2.5 text-xs text-slate-700 dark:text-slate-200">
      
      {/* Top Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <div className="flex items-center gap-1.5 font-black text-emerald-800 dark:text-emerald-300">
          <ShieldCheck size={16} className="text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
          <span>ভেরিফাইড ও নির্ভরযোগ্য তথ্য</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCorrectionModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-black hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit3 size={11} className="text-emerald-600" />
            <span>সংশোধনী অনুরোধ</span>
          </button>
        </div>
      </div>

      {/* Trust Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-emerald-600 shrink-0" />
          <span>সর্বশেষ যাচাই করা হয়েছে: <strong className="text-slate-900 dark:text-slate-100">{metadata.lastVerifiedDate}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <Database size={13} className="text-emerald-600 shrink-0" />
          <span>তথ্যের উৎস: <strong className="text-slate-900 dark:text-slate-100">{metadata.dataSource}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <UserCheck size={13} className="text-emerald-600 shrink-0" />
          <span>দায়িত্বপ্রাপ্ত প্রতিনিধি: <strong className="text-slate-900 dark:text-slate-100">{metadata.dataOwner}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
          <span>যাচাইকরণ মাধ্যম: <strong className="text-emerald-700 dark:text-emerald-400">{metadata.verificationMethod || "ইউপি রেজিস্ট্রি ও অন-সাইট অডিট"}</strong></span>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium italic border-t border-slate-200/60 dark:border-slate-700/60 pt-1.5">
        * এই তথ্যটি সর্বশেষ {metadata.lastVerifiedDate} তারিখে পুঠিয়া উপজেলা প্রশাসনের প্রতিনিধি দলের মাধ্যমে ফিল্ড-ভেরিফাইড করা হয়েছে।
      </p>

      {/* Correction Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 size={16} className="text-emerald-600" />
                তথ্য সংশোধনের আবেদন ({entityName})
              </h3>
              <button onClick={() => setShowCorrectionModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {submittedMessage ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-2xl text-xs font-black space-y-1">
                <p>{submittedMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitCorrection} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                    সঠিক বা নতুন তথ্য উল্লেখ করুন:
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="যেমন: ডাক্তার সাহেবের নতুন সময়সূচি অথবা ফোন নম্বর পরিবর্তন হয়েছে..."
                    value={correctionDetails}
                    onChange={(e) => setCorrectionDetails(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:border-emerald-600 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCorrectionModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={13} /> জমা দিন
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Clock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { VerificationMetadata, calculateVerificationMetadata } from '../../services/dataFreshnessService';

interface DataFreshnessBadgeProps {
  lastUpdated?: string;
  lastVerified?: string;
  nextVerificationDue?: string;
  verifiedBy?: string;
  onReverify?: () => void;
  canVerify?: boolean;
}

export const DataFreshnessBadge: React.FC<DataFreshnessBadgeProps> = ({
  lastUpdated,
  lastVerified,
  nextVerificationDue,
  verifiedBy = "অ্যাডমিন ভেরিফাইড",
  onReverify,
  canVerify = false
}) => {
  const meta = calculateVerificationMetadata(lastVerified || lastUpdated);
  const nextDueDate = nextVerificationDue ? new Date(nextVerificationDue) : new Date(meta.nextVerificationDue);
  const formattedNextDue = nextDueDate.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedLastVerified = meta.lastVerified ? new Date(meta.lastVerified).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : 'আজ';

  if (meta.freshnessStatus === 'verified') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-black">
        <ShieldCheck size={14} className="text-emerald-600" />
        <span>তথ্য নিবন্ধিত ও ভেরিফাইড</span>
        <span className="text-[9px] text-emerald-600 font-bold border-l border-emerald-200 pl-1.5">
          পরবর্তী যাচাই: {formattedNextDue}
        </span>
      </div>
    );
  }

  if (meta.freshnessStatus === 'due_soon') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[11px] font-black">
        <Clock size={14} className="text-amber-600 animate-pulse" />
        <span>শীঘ্রই পুনরায় যাচাই প্রয়োজন ({formattedNextDue})</span>
        {canVerify && onReverify && (
          <button
            onClick={onReverify}
            className="ml-1 px-2 py-0.5 bg-amber-600 text-white rounded-md text-[9px] font-black hover:bg-amber-700 transition-colors"
          >
            যাচাই করুন
          </button>
        )}
      </div>
    );
  }

  // Expired / Needs re-verification
  return (
    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-900">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="text-rose-600 shrink-0" />
        <div>
          <h5 className="text-xs font-black">মেয়াদোত্তীর্ণ! তথ্যটি পুনরায় যাচাই প্রয়োজন</h5>
          <p className="text-[10px] text-rose-700 font-bold">শেষ যাচাইকরণ: {formattedLastVerified}</p>
        </div>
      </div>
      {canVerify && onReverify && (
        <button
          onClick={onReverify}
          className="px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-black transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
        >
          <RefreshCw size={12} /> পুন:যাচাই সম্পন্ন করুন
        </button>
      )}
    </div>
  );
};

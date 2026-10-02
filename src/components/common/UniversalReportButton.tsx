import React from "react";
import { Flag, ShieldAlert, AlertTriangle } from "lucide-react";
import { useUniversalReport } from "../../context/UniversalReportContext";
import { ReportTarget } from "./UniversalReportModal";

interface UniversalReportButtonProps {
  contentId: string;
  contentType: string; // e.g. "doctor", "hospital", "job", "business", "post", "review", "rental", etc.
  contentTitle: string;
  contentOwnerId?: string;
  targetCollection?: string;
  variant?: "icon" | "button" | "text" | "badge" | "dropdown";
  label?: string;
  className?: string;
  iconOnly?: boolean;
}

export const UniversalReportButton: React.FC<UniversalReportButtonProps> = ({
  contentId,
  contentType,
  contentTitle,
  contentOwnerId,
  targetCollection,
  variant = "button",
  label = "রিপোর্ট করুন",
  className = "",
  iconOnly = false,
}) => {
  const { openReportModal } = useUniversalReport();

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const target: ReportTarget = {
      contentId,
      contentType,
      contentTitle,
      contentOwnerId,
      targetCollection,
      pageUrl: window.location.href,
    };

    openReportModal(target);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleReportClick}
        title={`${contentTitle} - আপত্তি বা রিপোর্ট করুন`}
        className={`p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center shrink-0 ${className}`}
      >
        <Flag className="w-4 h-4" />
      </button>
    );
  }

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={handleReportClick}
        className={`text-slate-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 border-none bg-transparent cursor-pointer transition ${className}`}
      >
        <Flag className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === "badge") {
    return (
      <button
        type="button"
        onClick={handleReportClick}
        className={`px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${className}`}
      >
        <ShieldAlert size={12} />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === "dropdown") {
    return (
      <button
        type="button"
        onClick={handleReportClick}
        className={`w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-none bg-transparent cursor-pointer transition ${className}`}
      >
        <ShieldAlert size={14} />
        <span>{label}</span>
      </button>
    );
  }

  // Default "button"
  return (
    <button
      type="button"
      onClick={handleReportClick}
      className={`px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${className}`}
    >
      <Flag className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-600" />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
};

export default UniversalReportButton;

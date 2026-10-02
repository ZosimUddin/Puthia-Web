import React, { useState } from "react";
import { FacebookBadgeIcon } from "./FacebookVerifiedBadge";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Store, 
  Landmark, 
  Award, 
  Building2, 
  UserCheck, 
  Sparkles 
} from "lucide-react";

export type VerificationType = 
  | "user" 
  | "business" 
  | "institution" 
  | "professional" 
  | "organization";

export interface VerificationBadgeProps {
  type?: VerificationType;
  variant?: "icon" | "chip" | "badge" | "full";
  size?: "xs" | "sm" | "md" | "lg";
  customLabel?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  className?: string;
  showTooltip?: boolean;
}

export const VERIFICATION_TYPES_CONFIG: Record<VerificationType, {
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeBg: string;
  description: string;
}> = {
  user: {
    label: "✓ Verified Citizen",
    shortLabel: "✓ Verified",
    icon: FacebookBadgeIcon as any,
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-800",
    borderClass: "border-emerald-200",
    badgeBg: "from-emerald-700 to-teal-800",
    description: "জাতীয় পরিচয়পত্র ও পুঠিয়া পোর্টাল ইউজার ভেরিফিকেশন সম্পন্ন।"
  },
  business: {
    label: "Verified Business",
    shortLabel: "Verified Business",
    icon: Store,
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-800",
    borderClass: "border-emerald-200",
    badgeBg: "from-emerald-600 to-teal-700",
    description: "ট্রেড লাইসেন্স ও সরেজমিনে পুঠিয়া টিম কর্তৃক ভেরিফাইড ব্যবসা প্রতিষ্ঠান।"
  },
  institution: {
    label: "Verified Institution",
    shortLabel: "Verified Institution",
    icon: Landmark,
    bgClass: "bg-indigo-50",
    textClass: "text-indigo-800",
    borderClass: "border-indigo-200",
    badgeBg: "from-indigo-600 to-purple-700",
    description: "সরকারী বা অনুমোদিত শিক্ষাপ্রতিষ্ঠান/হাসপাতাল/উপজেলা প্রতিষ্ঠান।"
  },
  professional: {
    label: "Verified Professional",
    shortLabel: "Verified Professional",
    icon: Award,
    bgClass: "bg-amber-50",
    textClass: "text-amber-900",
    borderClass: "border-amber-200",
    badgeBg: "from-amber-500 to-orange-600",
    description: "বিএমডিসি/আইনজীবী সনদ/ডিগ্রি প্রাপ্ত পেশাদার ব্যক্তি।"
  },
  organization: {
    label: "Verified Organization",
    shortLabel: "Verified Organization",
    icon: Building2,
    bgClass: "bg-teal-50",
    textClass: "text-teal-900",
    borderClass: "border-teal-200",
    badgeBg: "from-teal-600 to-cyan-700",
    description: "সমাজসেবা/অনুমোদিত ক্লাব, এনজিও বা সমাজকল্যাণ সংস্থা।"
  }
};

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  type = "user",
  variant = "chip",
  size = "sm",
  customLabel,
  verifiedAt,
  verifiedBy,
  className = "",
  showTooltip = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = VERIFICATION_TYPES_CONFIG[type] || VERIFICATION_TYPES_CONFIG.user;
  const IconComponent = config.icon;

  const displayLabel = customLabel || (variant === "icon" ? "" : config.label);

  // Icon Sizing
  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20
  };

  // Text Sizing
  const textSizes = {
    xs: "text-[10px]",
    sm: "text-[11px]",
    md: "text-xs",
    lg: "text-sm"
  };

  // Padding Sizing
  const paddingSizes = {
    xs: "px-1.5 py-0.5 gap-1",
    sm: "px-2 py-0.5 gap-1.5",
    md: "px-2.5 py-1 gap-1.5",
    lg: "px-3 py-1.5 gap-2"
  };

  if (variant === "icon") {
    return (
      <div 
        className="relative inline-flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`p-1 rounded-full ${config.bgClass} ${config.textClass} border ${config.borderClass} ${className}`}>
          <IconComponent size={iconSizes[size]} className="shrink-0" />
        </div>

        {showTooltip && isHovered && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white rounded-xl text-[10px] shadow-xl z-50 pointer-events-none text-center font-sans space-y-0.5 border border-slate-700">
            <p className="font-bold flex items-center justify-center gap-1 text-emerald-400">
              <ShieldCheck size={12} /> {config.label}
            </p>
            <p className="text-slate-300 text-[9px] leading-tight">{config.description}</p>
          </div>
        )}
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div 
        className={`bg-gradient-to-r ${config.badgeBg} text-white rounded-2xl p-3 shadow-md flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/20 backdrop-blur-xs rounded-xl shrink-0">
            <IconComponent size={20} className="text-white" />
          </div>
          <div className="text-left font-sans">
            <h5 className="text-xs font-black leading-tight flex items-center gap-1">
              <span>{config.label}</span>
              <Sparkles size={12} className="text-amber-300 animate-pulse" />
            </h5>
            <p className="text-[10px] text-white/80 font-medium leading-tight mt-0.5">
              {config.description}
            </p>
          </div>
        </div>

        {verifiedAt && (
          <span className="text-[9px] font-mono bg-black/20 px-2 py-1 rounded-lg text-white/90 shrink-0">
            {new Date(verifiedAt).toLocaleDateString("bn-BD")}
          </span>
        )}
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <span
        className={`inline-flex items-center ${paddingSizes[size]} bg-gradient-to-r ${config.badgeBg} text-white font-black rounded-lg shadow-2xs tracking-tight uppercase ${textSizes[size]} ${className}`}
      >
        <IconComponent size={iconSizes[size]} className="shrink-0" />
        <span>{displayLabel}</span>
      </span>
    );
  }

  // Default "chip"
  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={`inline-flex items-center ${paddingSizes[size]} ${config.bgClass} ${config.textClass} border ${config.borderClass} font-bold rounded-full transition-all hover:shadow-2xs ${textSizes[size]} ${className}`}
      >
        <IconComponent size={iconSizes[size]} className="shrink-0 text-current" />
        <span className="truncate">{displayLabel}</span>
      </span>

      {showTooltip && isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 bg-slate-900 text-white rounded-2xl text-[10px] shadow-2xl z-50 pointer-events-none text-left font-sans space-y-1 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-black text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={12} /> {config.label}
            </span>
            <span className="text-[8px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
              ভেরিফাইড
            </span>
          </div>
          <p className="text-slate-300 text-[10px] leading-snug">{config.description}</p>
          {verifiedBy && (
            <p className="text-[9px] text-slate-400 font-mono">অনুযায়ী: {verifiedBy}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationBadge;

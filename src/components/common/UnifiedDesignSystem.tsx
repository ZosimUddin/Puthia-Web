import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, X, ChevronRight, AlertCircle, Sparkles, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UniversalAddModal } from './UniversalAddModal';

// Landmark background image
// @ts-ignore
import puthiaBg from "../../assets/images/puthia_temple_bg_1783616072369.jpg";

/* ==========================================================================
   1. UNIFIED HERO HEADER
   ========================================================================== */
export interface UnifiedHeroHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badgeText?: string;
  showBack?: boolean;
  onBack?: () => void;
  gradient?: string;
  rightAction?: React.ReactNode;
  primaryCTA?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  className?: string;
  onAddClick?: () => void;
  showAddButton?: boolean;
  addCategory?: "emergency" | "notice" | "tolet" | "blood" | "lostfound" | "complaint" | "event" | "shop";
  addButtonColorClass?: string;
}

export const UnifiedHeroHeader: React.FC<UnifiedHeroHeaderProps> = ({
  title,
  subtitle,
  icon,
  badgeText,
  showBack = true,
  onBack,
  gradient,
  rightAction,
  primaryCTA,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "খুঁজুন...",
  children,
  className = "",
  onAddClick,
  showAddButton,
  addCategory,
  addButtonColorClass
}) => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Default showAddButton to true only if addCategory is specified.
  const shouldShowAdd = showAddButton !== undefined ? showAddButton : !!addCategory;
  const currentCategory = addCategory || "emergency";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handlePlusClick = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      setIsAddModalOpen(true);
    }
  };

  const bgGradientClass = gradient ? `bg-gradient-to-br ${gradient}` : "bg-[#006a4e]";

  return (
    <div className={`pt-3 pb-5 px-4 sm:px-6 text-white relative overflow-hidden shadow-sm ${bgGradientClass} ${className}`}>
      {/* Pattern & Landmark Background Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05] bg-cover bg-center pointer-events-none" 
        style={{ backgroundImage: `url(${puthiaBg})` }} 
      />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-2.5">
        {/* Top Bar: Back button & Badge / Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {showBack && (
              <button 
                onClick={handleBack}
                className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all border-none cursor-pointer backdrop-blur-md"
                aria-label="Back"
                title="পূর্ববর্তী পেজে ফিরে যান"
              >
                <ArrowLeft size={18} className="text-white" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {rightAction ? (
              rightAction
            ) : badgeText ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#00543e]/90 text-emerald-100 border border-emerald-300/30 shadow-2xs backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>{badgeText}</span>
              </span>
            ) : null}

            {shouldShowAdd && (
              <button
                onClick={handlePlusClick}
                className={`p-2 rounded-full bg-white hover:bg-emerald-50 text-[#006a4e] border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95 shadow-sm ${
                  addButtonColorClass || ""
                }`}
                title="নতুন তথ্য যোগ করুন"
                aria-label="Add New"
              >
                <Plus size={18} className="stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="pt-1">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{title}</span>
              </h1>
              {badgeText && rightAction && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#00543e]/90 text-emerald-100 border border-emerald-300/30 shadow-2xs backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>{badgeText}</span>
                </span>
              )}
            </div>

            {primaryCTA && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={primaryCTA.onClick}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-white text-[#006a4e] hover:bg-emerald-50 rounded-xl font-black text-xs shadow-md transition-all cursor-pointer shrink-0"
              >
                {primaryCTA.icon || <Sparkles size={14} />}
                <span>{primaryCTA.label}</span>
              </motion.button>
            )}
          </div>

          {subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-emerald-100 font-medium leading-relaxed mt-1.5 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Optional Search Bar */}
        {onSearchChange !== undefined && (
          <div className="relative mt-3 pt-1">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-white border-none rounded-full pl-11 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 shadow-md transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer border-none bg-transparent"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Extra children slot */}
        {children && <div className="mt-4">{children}</div>}
      </div>

      <UniversalAddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} defaultCategory={currentCategory as any} />
    </div>
  );
};

/* ==========================================================================
   2. UNIFIED CARD
   ========================================================================== */
export interface UnifiedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const UnifiedCard: React.FC<UnifiedCardProps> = ({
  children,
  className = "",
  onClick,
  hoverable = true
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[24px] p-[20px] border border-slate-100 shadow-sm ${
        hoverable ? "hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

/* ==========================================================================
   3. UNIFIED SECTION HEADER
   ========================================================================== */
export interface UnifiedSectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  seeAllText?: string;
  className?: string;
}

export const UnifiedSectionHeader: React.FC<UnifiedSectionHeaderProps> = ({
  icon,
  title,
  subtitle,
  onSeeAll,
  seeAllText = "সব দেখুন",
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-between gap-3 mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-2xl bg-[#EAFBF4] text-[#0E8F5B] flex items-center justify-center shrink-0 border border-emerald-100/60 shadow-2xs">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="inline-flex items-center gap-1 text-[#0E8F5B] hover:text-emerald-700 font-black text-xs sm:text-sm transition-all hover:gap-1.5 cursor-pointer shrink-0"
        >
          <span>{seeAllText}</span>
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

/* ==========================================================================
   4. UNIFIED GRID ITEM
   ========================================================================== */
export interface UnifiedGridItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: string;
  iconBgClass?: string;
  onClick?: () => void;
  className?: string;
}

export const UnifiedGridItem: React.FC<UnifiedGridItemProps> = ({
  icon,
  title,
  description,
  badge,
  iconBgClass = "bg-[#EAFBF4] text-[#0E8F5B] border border-emerald-100",
  onClick,
  className = ""
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white rounded-[24px] p-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between group relative ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${iconBgClass}`}>
            {icon}
          </div>
          {badge && (
            <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#0E8F5B] transition-colors leading-snug">
          {title}
        </h3>

        {description && (
          <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-bold text-[#0E8F5B]">
        <span>বিস্তারিত দেখুন</span>
        <ChevronRight size={16} className="text-slate-400 group-hover:text-[#0E8F5B] group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
};

/* ==========================================================================
   5. UNIFIED BOTTOM CTA CARD
   ========================================================================== */
export interface UnifiedBottomCTAProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  className?: string;
}

export const UnifiedBottomCTA: React.FC<UnifiedBottomCTAProps> = ({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
  className = ""
}) => {
  return (
    <div className={`bg-gradient-to-r from-[#065f46] via-[#0E8F5B] to-[#047857] text-white rounded-[24px] p-[24px] shadow-lg shadow-emerald-900/10 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5 ${className}`}>
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05] bg-cover bg-center pointer-events-none" 
        style={{ backgroundImage: `url(${puthiaBg})` }} 
      />

      <div className="flex items-center gap-4 relative z-10">
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            {icon}
          </div>
        )}
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-black text-white leading-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-emerald-100/90 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onButtonClick}
        className="relative z-10 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all whitespace-nowrap cursor-pointer shrink-0"
      >
        {buttonText}
      </motion.button>
    </div>
  );
};

/* ==========================================================================
   6. UNIFIED EMPTY STATE
   ========================================================================== */
export interface UnifiedEmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  onAddClick?: () => void;
  addButtonLabel?: string;
  addCategory?: string;
  className?: string;
}

export const UnifiedEmptyState: React.FC<UnifiedEmptyStateProps> = ({
  title = "এখনও কোনো তথ্য পাওয়া যায়নি",
  description = "আপনার তথ্য যোগ করে এই বিভাগটি সমৃদ্ধ করুন।",
  onReset,
  onAddClick,
  addButtonLabel = "তথ্য যোগ করুন",
  addCategory,
  className = ""
}) => {
  const handleAdd = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      window.dispatchEvent(new CustomEvent('open-universal-add', { detail: { category: addCategory } }));
    }
  };

  return (
    <div className={`bg-white rounded-[24px] p-8 sm:p-12 text-center border border-slate-100 shadow-sm space-y-4 my-4 max-w-2xl mx-auto ${className}`}>
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-[#0E8F5B] border border-emerald-100 shadow-2xs">
        <Sparkles size={28} />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-black text-slate-800">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 font-bold max-w-md mx-auto leading-relaxed">{description}</p>
      </div>
      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          onClick={handleAdd}
          className="px-6 py-2.5 bg-[#0E8F5B] hover:bg-[#065f46] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-900/10 active:scale-95 cursor-pointer inline-flex items-center gap-2"
        >
          <Plus size={16} className="stroke-[3]" />
          <span>{addButtonLabel}</span>
        </button>
        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2.5 bg-slate-50 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition inline-block cursor-pointer"
          >
            রিসেট করুন
          </button>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   7. UNIFIED ERROR STATE
   ========================================================================== */
export interface UnifiedErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const UnifiedErrorState: React.FC<UnifiedErrorStateProps> = ({
  title = "তথ্য লোড করা সম্ভব হয়নি",
  message = "নেটওয়ার্ক সমস্যা বা কারিগরি ত্রুটির কারণে ডেটা লোড করা সম্ভব হয়নি।",
  onRetry,
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-[24px] p-8 text-center border border-rose-100 shadow-sm space-y-3 ${className}`}>
      <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-base font-black text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-2xl hover:bg-rose-700 transition inline-block cursor-pointer shadow-sm"
        >
          আবার চেষ্টা করুন
        </button>
      )}
    </div>
  );
};

/* ==========================================================================
   8. UNIFIED BUTTON SYSTEM
   ========================================================================== */
export interface UnifiedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const UnifiedButton: React.FC<UnifiedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-black rounded-2xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed btn-press";
  
  const variantClasses = {
    primary: "bg-[#0E8F5B] hover:bg-[#065f46] text-white shadow-md shadow-emerald-900/10",
    secondary: "bg-emerald-50 hover:bg-emerald-100 text-[#0E8F5B] border border-emerald-200/80",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-2xs",
    ghost: "text-slate-700 hover:bg-slate-100/80 bg-transparent",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
  };

  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-xs sm:text-sm",
    lg: "px-6 py-3.5 text-sm sm:text-base"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

/* ==========================================================================
   9. SPECIALIZED REUSABLE CARDS
   ========================================================================== */
export const StandardCard = UnifiedCard;

export const ServiceCard: React.FC<{
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  categoryBadge?: string;
  onClick?: () => void;
  className?: string;
}> = ({ title, subtitle, icon, categoryBadge, onClick, className = '' }) => (
  <UnifiedGridItem
    title={title}
    description={subtitle}
    icon={icon}
    badge={categoryBadge}
    onClick={onClick}
    className={className}
  />
);

export const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
}> = ({ label, value, icon, trend, className = '' }) => (
  <div className={`bg-white rounded-[24px] p-5 border border-slate-100 shadow-2xs space-y-2 ${className}`}>
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      {icon && <div className="p-2 bg-emerald-50 text-[#0E8F5B] rounded-xl">{icon}</div>}
    </div>
    <div className="text-2xl font-black text-slate-900">{value}</div>
    {trend && <div className="text-[11px] font-bold text-emerald-600">{trend}</div>}
  </div>
);

/* ==========================================================================
   10. UNIFIED MODAL WRAPPER
   ========================================================================== */
export const UnifiedModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`bg-white rounded-[28px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 ${className}`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base sm:text-lg font-black text-slate-900">{title}</h3>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};


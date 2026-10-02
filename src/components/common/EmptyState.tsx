import React from 'react';
import { motion } from 'motion/react';
import { Inbox, SearchX, PackageX, FileQuestion, Plus, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'inbox' | 'search' | 'package' | 'question' | 'plus';
  action?: {
    label: string;
    onClick: () => void;
  };
  onAddClick?: () => void;
  addButtonLabel?: string;
  onRetry?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = "এখনও কোনো তথ্য পাওয়া যায়নি", 
  description = "আপনার তথ্য যোগ করে এই বিভাগটি সমৃদ্ধ করুন।", 
  icon = 'package',
  action,
  onAddClick,
  addButtonLabel = "তথ্য যোগ করুন",
  onRetry
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'inbox': return <Inbox className="w-12 h-12 text-emerald-600" />;
      case 'search': return <SearchX className="w-12 h-12 text-emerald-600" />;
      case 'package': return <PackageX className="w-12 h-12 text-emerald-600" />;
      case 'question': return <FileQuestion className="w-12 h-12 text-emerald-600" />;
      case 'plus': return <Plus className="w-12 h-12 text-emerald-600" />;
      default: return <PackageX className="w-12 h-12 text-emerald-600" />;
    }
  };

  const handleAction = onAddClick || action?.onClick || onRetry || (() => {
    window.dispatchEvent(new CustomEvent('open-universal-add'));
  });
  const buttonLabel = onAddClick ? addButtonLabel : (action?.label || addButtonLabel);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] my-4 w-full"
    >
      <div className="mb-4 p-5 bg-emerald-50/60 rounded-[24px] border border-emerald-100/60 shadow-2xs">
        {getIcon()}
      </div>
      <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mx-auto leading-relaxed font-bold text-xs sm:text-sm mb-6">
        {description}
      </p>
      <button
        onClick={handleAction}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0E8F5B] hover:bg-[#065f46] text-white rounded-xl font-black text-xs sm:text-sm transition-all shadow-md shadow-emerald-900/10 active:scale-95 min-h-[44px] cursor-pointer"
      >
        <Plus size={16} className="stroke-[3]" />
        <span>{buttonLabel}</span>
      </button>
    </motion.div>
  );
};


import React from "react";
import { motion } from "motion/react";
import { LucideIcon, RefreshCw, FolderX } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onRetry?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon = FolderX, 
  title = "কোন তথ্য পাওয়া যায়নি", 
  message = "বর্তমানে এই বিভাগে কোনো তথ্য বা বিবরণ উপলব্ধ নেই।", 
  action,
  onRetry 
}) => {
  const handleAction = action?.onClick || onRetry || (() => window.location.reload());
  const buttonLabel = action?.label || "আবার চেষ্টা করুন";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] text-center w-full h-full min-h-[300px] relative overflow-hidden my-2"
    >
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50/60 rounded-full blur-2xl -ml-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-50/60 rounded-full blur-2xl -mr-16 -mb-16 pointer-events-none" />

      <motion.div 
        animate={{ 
          y: [0, -8, 0],
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-20 h-20 bg-gradient-to-br from-slate-50 to-emerald-50/30 text-emerald-600 rounded-[24px] flex items-center justify-center mb-5 shadow-2xs border border-emerald-100/60 relative z-10"
      >
        <Icon size={38} strokeWidth={1.8} className="text-emerald-600" />
      </motion.div>
      
      <div className="relative z-10 max-w-[320px]">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed mb-6">
          {message}
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAction}
        className="relative z-10 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer min-h-[44px]"
      >
        <RefreshCw size={15} className="stroke-[2.5]" />
        <span>{buttonLabel}</span>
      </motion.button>
    </motion.div>
  );
};

export default EmptyState;

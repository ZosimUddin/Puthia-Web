import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: React.ReactNode;
  count?: number | string;
  className?: string;
  titleClassName?: string;
  centered?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  buttonText = "সব দেখুন", 
  onButtonClick,
  icon,
  count,
  className,
  titleClassName,
  centered = false
}) => {
  // Always use "সব দেখুন" unless buttonText is explicitly empty string
  const finalButtonText = buttonText === "" ? "" : "সব দেখুন";

  return (
    <div className={`flex ${centered ? "flex-col items-center text-center justify-center" : "flex-row items-center justify-between"} gap-2 sm:gap-3 mb-3 sm:mb-4 px-0.5 w-full ${className || ""}`}>
      <div className={`flex items-center gap-2.5 min-w-0 ${centered ? "flex-col justify-center text-center w-full" : "flex-1"}`}>
        {icon && (
          <div className="w-10 h-10 md:w-24 md:h-24 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs border border-emerald-200/60">
            {React.cloneElement(icon as React.ReactElement<any>, { 
              size: typeof window !== 'undefined' && window.innerWidth >= 768 ? 48 : 20, 
              className: "stroke-[2]" 
            })}
          </div>
        )}
        <div className={`min-w-0 ${centered ? "w-full text-center" : "flex-1"}`}>
          <div className={`flex items-center gap-2 ${centered ? "justify-center" : ""}`}>
            <h2 className={`text-lg md:text-6xl font-black tracking-tight leading-tight ${titleClassName || "text-slate-900"}`}>
              {title}
            </h2>
            {count !== undefined && count !== "" && count !== 0 && (
              <span className="text-[11px] md:text-3xl font-black px-2 py-0.5 md:px-6 md:py-2.5 bg-emerald-100/80 text-emerald-800 rounded-full border border-emerald-200/60">
                {count}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`text-xs md:text-3xl font-bold text-slate-500 leading-relaxed mt-1 ${centered ? "mx-auto text-center" : "max-w-lg md:max-w-4xl truncate"}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {onButtonClick && finalButtonText !== "" && (
        <motion.button 
          onClick={onButtonClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-1.5 text-xs sm:text-sm md:text-3xl font-extrabold text-emerald-700 bg-white px-3 py-1.5 sm:px-3.5 sm:py-2 md:px-10 md:py-5 rounded-xl md:rounded-2xl hover:bg-emerald-50/80 transition-all border border-emerald-200/80 whitespace-nowrap shadow-2xs hover:shadow-xs shrink-0 active:scale-95 group cursor-pointer"
        >
          <span>{finalButtonText}</span>
          <ArrowRight size={28} className="stroke-[2.5] group-hover:translate-x-0.5 transition-transform shrink-0 hidden md:block" />
          <ArrowRight size={14} className="stroke-[2.5] group-hover:translate-x-0.5 transition-transform shrink-0 md:hidden" />
        </motion.button>
      )}
    </div>
  );
};

export default SectionHeader;

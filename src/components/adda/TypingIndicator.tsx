import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface TypingUser {
  uid: string;
  name: string;
  photoURL?: string;
}

interface TypingIndicatorProps {
  typingUsers?: TypingUser[];
  userName?: string;
  userAvatar?: string;
  variant?: 'bubble' | 'header' | 'floating' | 'inline' | 'list';
  className?: string;
  onSimulateReply?: () => void;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers = [],
  userName,
  userAvatar,
  variant = 'bubble',
  className = '',
  onSimulateReply
}) => {
  // Consolidate users
  const activeUsers: TypingUser[] = typingUsers.length > 0 
    ? typingUsers 
    : (userName ? [{ uid: 'partner', name: userName, photoURL: userAvatar }] : []);

  if (activeUsers.length === 0) return null;

  const primaryUser = activeUsers[0];
  const count = activeUsers.length;

  const getDisplayText = () => {
    if (count === 1) {
      return `${primaryUser.name} is typing...`;
    } else if (count === 2) {
      return `${activeUsers[0].name} and ${activeUsers[1].name} are typing...`;
    } else {
      return `${primaryUser.name} and ${count - 1} others are typing...`;
    }
  };

  const getBanglaDisplayText = () => {
    if (count === 1) {
      return `${primaryUser.name} লিখছেন...`;
    } else if (count === 2) {
      return `${activeUsers[0].name} ও ${activeUsers[1].name} লিখছেন...`;
    } else {
      return `${primaryUser.name} সহ ${count} জন লিখছেন...`;
    }
  };

  // Header Subtitle Variant
  if (variant === 'header') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-blue-600 font-bold ${className}`}>
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
        </span>
        <span className="truncate">{getBanglaDisplayText()}</span>
      </span>
    );
  }

  // Conversation List Sneak Peek Variant
  if (variant === 'list') {
    return (
      <span className={`inline-flex items-center gap-1 text-[#0084FF] font-bold text-xs tracking-tight ${className}`}>
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 bg-[#0084FF] rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 bg-[#0084FF] rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 bg-[#0084FF] rounded-full animate-bounce" />
        </span>
        <span className="italic">{count > 1 ? 'Typing...' : 'Typing...'}</span>
      </span>
    );
  }

  // Floating Bar above Input Field Variant
  if (variant === 'floating') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`px-3 py-1.5 bg-white/95 backdrop-blur-xs border border-blue-100 shadow-sm rounded-full flex items-center justify-between text-xs text-slate-700 mx-3 mb-1.5 z-10 ${className}`}
      >
        <div className="flex items-center gap-2">
          {primaryUser.photoURL ? (
            <img 
              src={primaryUser.photoURL} 
              alt={primaryUser.name} 
              className="w-5 h-5 rounded-full object-cover border border-blue-200" 
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
              {primaryUser.name.charAt(0)}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-800 text-[12px]">{getBanglaDisplayText()}</span>
            <span className="flex items-center gap-1 ml-0.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Standard Facebook Messenger Chat Bubble Variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: 4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex items-end gap-2 my-1 max-w-[85%] ${className}`}
      aria-live="polite"
      aria-label={`${primaryUser.name} is typing`}
    >
      {/* User avatar next to bubble */}
      <div className="relative shrink-0">
        {primaryUser.photoURL ? (
          <img
            src={primaryUser.photoURL}
            alt={primaryUser.name}
            className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-2xs"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            {primaryUser.name.charAt(0)}
          </div>
        )}
        <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
      </div>

      {/* Messenger speech bubble with 3 animated bouncing dots */}
      <div className="flex flex-col items-start gap-1">
        <div className="bg-[#f0f2f5] text-slate-700 px-4 py-2.5 rounded-2xl rounded-bl-xs shadow-2xs flex items-center gap-1.5 border border-slate-200/50">
          <span 
            className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.32s] [animation-duration:1s]" 
            style={{ animationTimingFunction: 'cubic-bezier(0.28, 0.84, 0.42, 1)' }}
          />
          <span 
            className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.16s] [animation-duration:1s]" 
            style={{ animationTimingFunction: 'cubic-bezier(0.28, 0.84, 0.42, 1)' }}
          />
          <span 
            className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-duration:1s]" 
            style={{ animationTimingFunction: 'cubic-bezier(0.28, 0.84, 0.42, 1)' }}
          />
        </div>
        
        {/* Subtle sub-label for clarity */}
        <span className="text-[10px] font-medium text-slate-400 pl-1">
          {getBanglaDisplayText()}
        </span>
      </div>
    </motion.div>
  );
};

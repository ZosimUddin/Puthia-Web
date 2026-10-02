import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, Sparkles, X, UserCheck, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VerificationApplyModal } from "./VerificationApplyModal";

export interface FacebookVerifiedBadgeProps {
  size?: number;
  className?: string;
  name?: string;
  badgeType?: "user" | "business" | "official" | "professional";
  interactive?: boolean;
  colorScheme?: "emerald" | "blue" | "gold";
}

export const FacebookBadgeIcon: React.FC<{ size?: number; className?: string; colorScheme?: "emerald" | "blue" | "gold" }> = ({
  size = 15,
  className = "",
  colorScheme = "emerald"
}) => {
  const fillColor = colorScheme === "blue" ? "#1877F2" : colorScheme === "gold" ? "#D97706" : "#006A4E";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 align-middle select-none ${className}`}
    >
      <path
        d="M10.29 2.3a1.93 1.93 0 0 1 3.42 0l.61 1.06a1.93 1.93 0 0 0 1.91.95l1.22-.16a1.93 1.93 0 0 1 2.15 2.15l-.16 1.22a1.93 1.93 0 0 0 .95 1.91l1.06.61a1.93 1.93 0 0 1 0 3.42l-1.06.61a1.93 1.93 0 0 0-.95 1.91l.16 1.22a1.93 1.93 0 0 1-2.15 2.15l-1.22-.16a1.93 1.93 0 0 0-1.91.95l-.61 1.06a1.93 1.93 0 0 1-3.42 0l-.61-1.06a1.93 1.93 0 0 0-1.91-.95l-1.22.16a1.93 1.93 0 0 1-2.15-2.15l.16-1.22a1.93 1.93 0 0 0-.95-1.91l-1.06-.61a1.93 1.93 0 0 1 0-3.42l1.06-.61a1.93 1.93 0 0 0 .95-1.91l-.16-1.22a1.93 1.93 0 0 1 2.15-2.15l1.22.16a1.93 1.93 0 0 0 1.91-.95l.61-1.06z"
        fill={fillColor}
      />
      <path
        d="M8.5 12.2l2.3 2.3 4.8-4.8"
        stroke="#FFFFFF"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const FacebookVerifiedBadge: React.FC<FacebookVerifiedBadgeProps> = ({
  size = 15,
  className = "",
  name = "",
  badgeType = "user",
  interactive = true,
  colorScheme = "emerald"
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const badgeTitle = badgeType === "business" 
    ? "ভেরিফাইড ব্যবসা প্রতিষ্ঠান" 
    : badgeType === "official" 
    ? "অফিসিয়াল পুঠিয়া নাগরিক / প্রতিষ্ঠান" 
    : badgeType === "professional"
    ? "ভেরিফাইড পেশাজীবী"
    : "ভেরিফাইড নাগরিক (Verified Profile)";

  const handleBadgeClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    setShowModal(true);
  };

  return (
    <>
      <span
        onClick={handleBadgeClick}
        className={`inline-flex items-center cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150 ${className}`}
        title={`${badgeTitle} - বিস্তারিত দেখতে ক্লিক করুন`}
      >
        <FacebookBadgeIcon size={size} colorScheme={colorScheme} />
      </span>

      {/* Facebook Meta Verified Style Popover Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans text-left" onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-5 text-white relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition border-0 cursor-pointer"
                >
                  <X size={16} />
                </button>

                <div className="flex flex-col items-center text-center space-y-2 pt-2">
                  <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center ring-4 ring-white/20">
                    <FacebookBadgeIcon size={32} colorScheme="emerald" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center justify-center gap-1.5">
                      <span>{name || "অফিসিয়াল অ্যাকাউন্ট"}</span>
                      <FacebookBadgeIcon size={16} colorScheme="emerald" />
                    </h3>
                    <p className="text-[11px] text-emerald-100 font-bold mt-0.5">{badgeTitle}</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                <div className="bg-emerald-50/80 rounded-2xl p-3.5 border border-emerald-100 space-y-2 text-xs">
                  <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                    <span>ভেরিফাইড পরিচয়পত্রের তথ্য:</span>
                  </p>
                  <p className="text-emerald-900 leading-relaxed text-[11.5px]">
                    এই প্রোফাইলটি পুঠিয়া আড্ডা টিম কর্তৃক জাতীয় পরিচয়পত্র (NID) অথবা ট্রেড লাইসেন্স ও প্রয়োজনীয় কাগজপত্র যাচাইয়ের মাধ্যমে অফিসিয়ালি **ভেরিফাইড** হিসেবে চিহ্নিত করা হয়েছে।
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    ভেরিফাইড ব্যাজের সুবিধাসমূহ:
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-700 font-medium pl-1">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <span>নামের পাশে আসল নীল/সবুজ ভেরিফাইড নীল-ব্যাজ প্রদর্শন</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <span>আড্ডা ফিড ও কমেন্টে গ্রাহকদের নিকট সর্বোচ্চ বিশ্বস্ততা</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <span>সার্চ রেজাল্ট ও তালিকায় প্রাধিকার রিচ লাভ</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setShowApplyModal(true);
                    }}
                    className="w-full py-2.5 px-4 bg-[#006a4e] hover:bg-[#00543e] text-white font-black text-xs rounded-xl shadow-md transition border-0 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles size={15} className="text-amber-300 animate-pulse" />
                    <span>নিজের প্রোফাইলেও ভেরিফাইড ব্যাজ নিন</span>
                  </button>

                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition border-0 cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Verification Request Application Modal */}
      <VerificationApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        defaultType={badgeType === "business" ? "business" : "user"}
        defaultEntityName={name}
      />
    </>
  );
};

export default FacebookVerifiedBadge;

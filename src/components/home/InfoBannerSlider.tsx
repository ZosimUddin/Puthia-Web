import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const BANNERS = [
  {
    id: 1,
    text: "নিয়মিত পুঠিয়ার সকল তথ্য এড করে আমাদেরকে সহযোগিতা করুন",
    bg: "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700",
  },
  {
    id: 2,
    text: "পুঠিয়া উপজেলার সকল তথ্য সেবা পেতে আমাদের পুঠিয়া অ্যাপ ব্যবহার করুন",
    bg: "bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800",
  },
  {
    id: 3,
    text: "জরুরী রক্তদাতা, ডাক্তার ডিরেক্টরি ও নাগরিক সেবা পেতে আমাদের সাথে থাকুন",
    bg: "bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700",
  },
];

export const InfoBannerSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-2 pb-4 select-none">
      {/* Banner Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-md min-h-[90px] sm:min-h-[110px] flex items-center justify-center p-4 text-center cursor-pointer">
        <AnimatePresence mode="wait">
          <motion.div
            key={BANNERS[currentIndex].id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={`absolute inset-0 ${BANNERS[currentIndex].bg} flex items-center justify-center p-5 text-white shadow-inner`}
          >
            <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-wide leading-relaxed max-w-2xl drop-shadow-xs">
              {BANNERS[currentIndex].text}
            </h3>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Indicator Dots */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Slide ${index + 1}`}
            className={`dot-indicator min-w-0 min-h-0 transition-all duration-300 rounded-full cursor-pointer p-0 border-0 ${
              currentIndex === index
                ? "w-6 h-2 bg-emerald-600"
                : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
            }`}
            style={{
              minWidth: currentIndex === index ? '24px' : '8px',
              minHeight: '8px',
              maxWidth: currentIndex === index ? '24px' : '8px',
              maxHeight: '8px',
              width: currentIndex === index ? '24px' : '8px',
              height: '8px'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default InfoBannerSlider;

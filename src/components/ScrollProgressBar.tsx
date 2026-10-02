import React, { useEffect, useState } from "react";

export const ScrollProgressBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 transition-all duration-75 ease-out shadow-[0_0_10px_rgba(16,185,129,0.8)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

export default ScrollProgressBar;

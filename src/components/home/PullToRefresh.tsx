import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "motion/react";
import { RefreshCw, Check } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const controls = useAnimation();

  const isMounted = useRef(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    setHasMounted(true);
    return () => {
      isMounted.current = false;
      setHasMounted(false);
      try {
        controls.stop();
      } catch (e) {
        // Ignore unmount stop errors
      }
    };
  }, [controls]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].pageY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing && !showSuccess) {
      const currentY = e.touches[0].pageY;
      const distance = Math.max(0, currentY - startY.current);
      
      // Add resistance
      const dampedDistance = Math.pow(distance, 0.85) * 2;
      
      if (distance > 0 && dampedDistance < 180) {
        setPullDistance(dampedDistance);
        if (isMounted.current && hasMounted) {
          try {
            controls.set({ y: dampedDistance / 1.5 });
          } catch (e) {
            // Ignore unmounted control call
          }
        }
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 80 && !isRefreshing && !showSuccess) {
      setIsRefreshing(true);
      if (isMounted.current && hasMounted) {
        try {
          await controls.start({ y: 70 });
        } catch (e) {
          // Ignore animation interruptions
        }
      }
      
      try {
        await onRefresh();
        if (isMounted.current && hasMounted) {
          setShowSuccess(true);
          setTimeout(() => {
            if (isMounted.current && hasMounted) {
              setShowSuccess(false);
              setPullDistance(0);
              try {
                controls.start({ y: 0 }).catch(() => {});
              } catch (e) {}
            }
          }, 1000);
        }
      } catch (error) {
        if (isMounted.current && hasMounted) {
          setPullDistance(0);
          try {
            controls.start({ y: 0 }).catch(() => {});
          } catch (e) {}
        }
      } finally {
        if (isMounted.current) {
          setIsRefreshing(false);
        }
      }
    } else {
      setPullDistance(0);
      if (isMounted.current && hasMounted) {
        try {
          controls.start({ y: 0 }).catch(() => {});
        } catch (e) {}
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      <div 
        className="absolute top-0 left-0 w-full overflow-hidden flex items-end justify-center pointer-events-none z-50 px-4"
        style={{ height: Math.max(pullDistance, 100), top: -100 }}
      >
        <AnimatePresence>
          {pullDistance > 20 && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              className="bg-white p-3 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-center mb-6"
            >
              {showSuccess ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-emerald-500"
                >
                  <Check size={24} strokeWidth={3} />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ rotate: isRefreshing ? 360 : pullDistance * 3 }}
                  transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0 }}
                  className="text-slate-800"
                >
                  <RefreshCw size={24} strokeWidth={2.5} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        animate={controls}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;

import React from 'react';
import { motion } from 'motion/react';

interface PremiumAnimationProps {
  type: 'success' | 'celebration' | 'pulse' | 'badge' | 'loading' | 'star';
  size?: number;
  className?: string;
}

export const PremiumAnimation: React.FC<PremiumAnimationProps> = ({
  type,
  size = 80,
  className = ""
}) => {
  if (type === 'success') {
    return (
      <div style={{ width: size, height: size }} className={`relative flex items-center justify-center ${className}`}>
        {/* Ambient Ring Glow */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.8, 1.2, 1], opacity: [0, 0.4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md"
        />
        {/* Growing circle */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          initial="hidden"
          animate="visible"
        >
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            stroke="#10b981"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: { pathLength: 1, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
            }}
          />
          {/* Animated Checkmark Path */}
          <motion.path
            d="M32 52 L45 64 L68 38"
            stroke="#10b981"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              hidden: { pathLength: 0 },
              visible: { pathLength: 1, transition: { delay: 0.5, duration: 0.4, ease: "easeInOut" } }
            }}
          />
        </motion.svg>
      </div>
    );
  }

  if (type === 'celebration') {
    return (
      <div style={{ width: size, height: size }} className={`relative ${className}`}>
        {/* Dynamic Burst Particles resembling Lottie explosions */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(12)].map((_, i) => {
            const angle = (i * 360) / 12;
            const radius = size * 0.45;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.2 }}
                animate={{ x, y, opacity: [1, 1, 0], scale: [0.2, 1.2, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.3, ease: "easeOut", delay: (i % 3) * 0.1 }}
                className={`absolute w-2 h-2 rounded-full ${
                  i % 3 === 0 ? 'bg-amber-400' : i % 3 === 1 ? 'bg-emerald-500' : 'bg-blue-400'
                }`}
              />
            );
          })}
        </div>
        {/* Floating trophy / medal icon */}
        <motion.div
          animate={{ y: [-3, 3, -3], rotate: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center text-4xl select-none"
        >
          🏆
        </motion.div>
      </div>
    );
  }

  if (type === 'badge') {
    return (
      <div style={{ width: size, height: size }} className={`relative flex items-center justify-center ${className}`}>
        {/* Rotating sunburst behind */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-15 bg-[radial-gradient(circle,_#f59e0b_10%,_transparent_70%)] bg-no-repeat"
          style={{ backgroundImage: 'repeating-conic-gradient(from 0deg, #f59e0b 0deg 15deg, transparent 15deg 30deg)' }}
        />
        {/* Floating badge */}
        <motion.div
          animate={{ y: [-4, 4, -4], scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative text-5xl drop-shadow-xl select-none"
        >
          🥇
        </motion.div>
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div style={{ width: size, height: size }} className={`relative flex items-center justify-center ${className}`}>
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-2/3 h-2/3 rounded-full bg-emerald-500/20 border border-emerald-500/30"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-1/3 h-1/3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
        />
      </div>
    );
  }

  if (type === 'star') {
    return (
      <div style={{ width: size, height: size }} className={`relative flex items-center justify-center ${className}`}>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.1, scale: 0.5 }}
            animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.5, 0.5], rotate: [0, 18, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
            className="absolute text-xl select-none"
            style={{
              top: `${20 + Math.sin(i) * 20}%`,
              left: `${30 + Math.cos(i) * 30}%`
            }}
          >
            ⭐
          </motion.div>
        ))}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl filter drop-shadow-md select-none"
        >
          ✨
        </motion.div>
      </div>
    );
  }

  // Fallback Loading
  return (
    <div style={{ width: size, height: size }} className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
      />
    </div>
  );
};

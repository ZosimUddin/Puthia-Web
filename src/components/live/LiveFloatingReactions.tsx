import React, { useEffect, useState } from 'react';
import { LiveReaction, LIVE_REACTIONS } from '../../types/live';

interface LiveFloatingReactionsProps {
  streamId: string;
  activeReaction?: LiveReaction | null;
}

interface FloatingParticle {
  id: string;
  emoji: string;
  x: number; // percentage 10-90
  duration: number; // seconds
}

export const LiveFloatingReactions: React.FC<LiveFloatingReactionsProps> = ({ activeReaction }) => {
  const [particles, setParticles] = useState<FloatingParticle[]>([]);

  useEffect(() => {
    if (!activeReaction) return;

    const meta = LIVE_REACTIONS.find(r => r.type === activeReaction.type) || LIVE_REACTIONS[0];
    const newParticle: FloatingParticle = {
      id: `${activeReaction.id}_${Math.random()}`,
      emoji: meta.emoji,
      x: activeReaction.xPosition || Math.floor(Math.random() * 70) + 15,
      duration: Math.random() * 1.5 + 2, // 2s to 3.5s
    };

    setParticles(prev => [...prev.slice(-25), newParticle]);

    const timer = setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, newParticle.duration * 1000);

    return () => clearTimeout(timer);
  }, [activeReaction]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute bottom-12 animate-float-up text-2xl sm:text-3xl filter drop-shadow-md transition-all ease-out"
          style={{
            left: `${p.x}%`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.6) rotate(0deg);
            opacity: 0.9;
          }
          50% {
            transform: translateY(-120px) scale(1.2) rotate(-10deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-280px) scale(1.5) rotate(15deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: floatUp ease-out forwards;
        }
      `}</style>
    </div>
  );
};

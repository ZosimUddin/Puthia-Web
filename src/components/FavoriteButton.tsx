import React from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFavorites, SavedItem } from './FavoriteContext';

export const FavoriteButton: React.FC<{ item: SavedItem; className?: string }> = ({ item, className = '' }) => {
  const { toggleSave, isSaved } = useFavorites();
  const saved = isSaved(item.id);

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onClick={(e) => {
        e.stopPropagation();
        toggleSave(item);
      }}
      className={`relative p-1.5 rounded-full transition-colors duration-200 cursor-pointer overflow-visible ${
        saved ? 'bg-rose-50 text-rose-500 shadow-2xs' : 'bg-gray-50/80 text-gray-400 hover:bg-gray-100'
      } ${className}`}
      aria-label={saved ? "Remove from saved" : "Save item"}
    >
      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div
            key="saved"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.35, 1] }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            <Heart className="w-5 h-5 fill-current text-rose-500" />
            <motion.span
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border border-rose-500 pointer-events-none"
            />
          </motion.div>
        ) : (
          <motion.div
            key="unsaved"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Heart className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};


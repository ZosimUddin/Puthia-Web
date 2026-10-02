import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { addDoc, collection, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: string; // e.g., 'business', 'place'
  targetName: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, targetId, targetType, targetName }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("রেটিং দিতে লগইন করুন");
      return;
    }
    if (rating === 0) {
      alert("অনুগ্রহ করে রেটিং দিন (১-৫)");
      return;
    }

    setLoading(true);
    try {
      // Add review document
      await addDoc(collection(db, 'reviews'), {
        targetId,
        targetType,
        rating,
        feedback,
        userId: user.uid,
        userName: user.displayName || 'ব্যবহারকারী',
        createdAt: serverTimestamp(),
      });

      // Simple implementation: Just update the ratingCount and a moving average in the target doc
      // For more accurate results, a cloud function should be used.
      try {
        const targetRef = doc(db, targetType === 'business' ? 'businesses' : 'places', targetId);
        await updateDoc(targetRef, {
          ratingCount: increment(1)
          // Average rating update logic goes here if we want to store it on the document
        });
      } catch (updateErr) {
        console.error("Could not update target rating count", updateErr);
      }

      alert("আপনার রেটিং এবং মতামতের জন্য ধন্যবাদ!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("রেটিং সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800">মতামত দিন</h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>

          <p className="text-sm font-bold text-slate-500 mb-6">
            <span className="text-emerald-600">{targetName}</span> সম্পর্কে আপনার মতামত আমাদের জানান
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star 
                    size={32} 
                    className={`${(hoverRating || rating) >= star ? 'text-emerald-500 fill-amber-400' : 'text-slate-200'} transition-colors`} 
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">আপনার মতামত (ঐচ্ছিক)</label>
              <textarea
                value={feedback || ""}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="আপনার অভিজ্ঞতা শেয়ার করুন..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-medium text-sm"
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50"
            >
              {loading ? 'সাবমিট হচ্ছে...' : 'সাবমিট করুন'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

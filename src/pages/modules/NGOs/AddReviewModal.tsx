import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Star, Send } from 'lucide-react';

interface AddReviewModalProps {
  ngoName: string;
  onSubmit: (rating: number, comment: string) => void;
  onClose: () => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  ngoName,
  onSubmit,
  onClose
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    onSubmit(rating, comment.trim());
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10009] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[28px] w-full max-w-md shadow-2xl p-6 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-800">রিভিউ দিন</h3>
            <p className="text-xs font-bold text-slate-400 line-clamp-1">{ngoName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">রেটিং নির্বাচন করুন</label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-black text-amber-600">
              {rating === 5 ? '৫ - চমৎকার সেবামূলক কাজ' : rating === 4 ? '৪ - খুব ভালো' : rating === 3 ? '৩ - মোটামুটি' : rating === 2 ? '২ - আরও উন্নয়ন প্রয়োজন' : '১ - অসন্তোষজনক'}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">আপনার অভিজ্ঞতা লিখুন *</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="এই এনজিওর সেবা, কার্যক্রম বা অভিজ্ঞতা সম্পর্কে বাংলায় আপনার মতামত দিন..."
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="w-full py-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send size={16} /> সাবমিট করুন
          </button>
        </form>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, AlertTriangle, Send, ShieldCheck } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';

interface ReportInfoModalProps {
  ngoId: string;
  ngoName: string;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ReportInfoModal: React.FC<ReportInfoModalProps> = ({
  ngoId,
  ngoName,
  onClose,
  onShowToast
}) => {
  const [incorrectInfo, setIncorrectInfo] = useState('');
  const [correctInfo, setCorrectInfo] = useState('');
  const [comments, setComments] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "ngo_reports"), {
        ngoId,
        ngoName,
        incorrectInfo,
        correctInfo,
        comments,
        documentUrl,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      onShowToast("আপনার সংশোধনের অনুরোধ সফলভাবে জমা দেওয়া হয়েছে।");
      onClose();
    } catch (error) {
      console.error("Report submission error:", error);
      onShowToast("অনুরোধ জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10009] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[28px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 bg-amber-50 border-b border-amber-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">তথ্য সংশোধনের অনুরোধ</h3>
              <p className="text-xs font-bold text-slate-500 line-clamp-1">{ngoName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-amber-100 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">কী তথ্য ভুল? *</label>
            <input
              required
              value={incorrectInfo}
              onChange={(e) => setIncorrectInfo(e.target.value)}
              placeholder="যেমন: ফোন নম্বর বা ঠিকানা ভুল"
              className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">সঠিক তথ্য *</label>
            <textarea
              required
              rows={3}
              value={correctInfo}
              onChange={(e) => setCorrectInfo(e.target.value)}
              placeholder="সঠিক তথ্য বিস্তারিত লিখুন..."
              className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">মন্তব্য (ঐচ্ছিক)</label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="বাড়তি কোনো মন্তব্য..."
              className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ছবি/ডকুমেন্ট লিংক (ঐচ্ছিক)</label>
            <input
              type="url"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
              আপনার দেওয়া তথ্য যাচাই করার পর এনজিওর প্রোফাইলে সংশোধন করা হবে।
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send size={16} /> {isSubmitting ? 'প্রসেস হচ্ছে...' : 'অনুরোধ জমা দিন'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

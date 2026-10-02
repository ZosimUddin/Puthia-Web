import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { Vehicle } from './types';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase';
import { toast } from 'sonner';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  vehicle
}) => {
  const [reason, setReason] = useState('ভুল ভাড়া');
  const [description, setDescription] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'vehicle_reports'), {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        reason,
        description,
        reporterPhone,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    } catch (e) {}

    setIsSubmitting(false);
    toast.success('আপনার রিপোর্টের জন্য ধন্যবাদ। এডমিন প্যানেল এটি পর্যালোচনা করবে।');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle size={18} />
              <span>তথ্য সংশোধনের অনুরোধ</span>
            </div>
            <button onClick={onClose} className="border-none bg-transparent text-slate-400 cursor-pointer">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs text-slate-600">
              <b>{vehicle.name}</b> সংক্রান্ত ভুল বা ভুয়া তথ্য জানান:
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">সমস্যার ধরন</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="ভুল ভাড়া">ভুল ভাড়া দেখানো হয়েছে</option>
                <option value="ভুল ফোন নম্বর">ফোন নম্বরে যোগাযোগ করা যাচ্ছে না</option>
                <option value="গাড়ি আর নেই">গাড়িটি এখন সার্ভিস দেয় না</option>
                <option value="প্রতারণার অভিযোগ">প্রতারণা বা ভুয়া বিজ্ঞাপন</option>
                <option value="অন্য সমস্যা">অন্যান্য সমস্যা</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">বিবরণ</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="সমস্যাটির স্পষ্ট বিবরণ লিখুন..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">আপনার ফোন নম্বর (ঐচ্ছিক)</label>
              <input
                type="tel"
                value={reporterPhone}
                onChange={e => setReporterPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send size={14} />
                <span>রিপোর্ট জমা দিন</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportModal;

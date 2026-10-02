import React, { useState } from 'react';
import { Shield, Search, X, UserCheck } from 'lucide-react';

interface AddModeratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddModerator: (userUid: string) => Promise<void>;
}

export const AddModeratorModal: React.FC<AddModeratorModalProps> = ({
  isOpen,
  onClose,
  onAddModerator,
}) => {
  const [searchUid, setSearchUid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUid.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddModerator(searchUid.trim());
      alert('মডারেটর সফলভাবে যুক্ত হয়েছে!');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm text-white shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-sm flex items-center gap-2 text-blue-400">
            <Shield size={18} /> মডারেটর যুক্ত করুন (Add Moderator)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <p className="text-slate-300 text-[11px] leading-relaxed">
            মডারেটর লাইভ চলাকালীন স্প্যাম কমেন্ট ডিলিট, ইউজারের কমেন্ট হাইড এবং লাইভ রিপোর্ট ম্যানেজ করতে পারবেন।
          </p>

          <div>
            <label className="block text-slate-300 font-bold mb-1">ইউজার ID বা ইউজারনেম</label>
            <input
              type="text"
              required
              placeholder="ইউজার ID প্রদান করুন..."
              value={searchUid}
              onChange={e => setSearchUid(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-300 hover:text-white cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !searchUid.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck size={14} /> {isSubmitting ? 'প্রসেসিং...' : 'মডারেটর করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

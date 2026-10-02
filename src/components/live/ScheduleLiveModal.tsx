import React, { useState } from 'react';
import { Calendar, Clock, X, Radio, MapPin, Image } from 'lucide-react';
import { LIVE_CATEGORIES, LiveCategory, LiveAudience } from '../../types/live';

interface ScheduleLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleLive: (data: {
    title: string;
    description?: string;
    coverUrl?: string;
    category: LiveCategory;
    audience: LiveAudience;
    location?: string;
    scheduledFor: number;
  }) => Promise<void>;
}

export const ScheduleLiveModal: React.FC<ScheduleLiveModalProps> = ({
  isOpen,
  onClose,
  onScheduleLive,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [category, setCategory] = useState<LiveCategory>('News');
  const [audience, setAudience] = useState<LiveAudience>('public');
  const [location, setLocation] = useState('পুঠিয়া রাজবাড়ী');
  const [coverUrl, setCoverUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateStr || !timeStr) return;

    const scheduledTimestamp = new Date(`${dateStr}T${timeStr}`).getTime();
    if (isNaN(scheduledTimestamp)) return;

    setIsSubmitting(true);
    try {
      await onScheduleLive({
        title: title.trim(),
        description: description.trim(),
        coverUrl: coverUrl.trim(),
        category,
        audience,
        location,
        scheduledFor: scheduledTimestamp,
      });
      onClose();
    } catch (err) {
      console.error('Schedule live error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg text-white shadow-2xl overflow-hidden my-auto">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <h3 className="font-bold text-base flex items-center gap-2 text-white">
            <Calendar size={18} className="text-emerald-400" /> লাইভ শিডিউল করুন (Schedule Live)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              লাইভের শিরোনাম <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: বানেশ্বর হাটের বিশেষ আলোচনা..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/15 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                তারিখ <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                সময় <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                required
                value={timeStr}
                onChange={e => setTimeStr(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">ক্যাটাগরি</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as LiveCategory)}
                className="w-full bg-slate-950 border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                {LIVE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nameBangla}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">অডিয়েন্স</label>
              <select
                value={audience}
                onChange={e => setAudience(e.target.value as LiveAudience)}
                className="w-full bg-slate-950 border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="public">🌎 পাবলিক</option>
                <option value="friends">👥 ফ্রেন্ডস</option>
                <option value="followers">⭐ ফলোয়ার্স</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">বিবরণ (ঐচ্ছিক)</label>
            <textarea
              rows={2}
              placeholder="লাইভ বিষয় বিস্তারিত..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/15 focus:border-emerald-500 rounded-xl p-3 text-xs text-white outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !dateStr || !timeStr}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              {isSubmitting ? 'শিডিউল করা হচ্ছে...' : '📅 Schedule Live'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

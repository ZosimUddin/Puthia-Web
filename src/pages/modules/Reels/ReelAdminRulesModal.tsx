import React, { useState } from 'react';
import { X, ShieldAlert, Check, Settings, Video, Sliders } from 'lucide-react';
import { ReelRulesConfig } from '../../../types';
import { DEFAULT_REEL_RULES } from '../../../data/reelAudioData';

interface ReelAdminRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRules: (rules: ReelRulesConfig) => void;
  currentRules?: ReelRulesConfig;
}

export const ReelAdminRulesModal: React.FC<ReelAdminRulesModalProps> = ({
  isOpen,
  onClose,
  onSaveRules,
  currentRules = DEFAULT_REEL_RULES
}) => {
  const [maxDuration, setMaxDuration] = useState<number>(currentRules.maxDuration || 90);
  const [maxFileSizeMB, setMaxFileSizeMB] = useState<number>(currentRules.maxFileSizeMB || 60);
  const [allowOriginalAudio, setAllowOriginalAudio] = useState(currentRules.allowOriginalAudio ?? true);
  const [allowComments, setAllowComments] = useState(currentRules.allowComments ?? true);
  const [allowDownloads, setAllowDownloads] = useState(currentRules.allowDownloads ?? true);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRules({
      maxDuration,
      maxFileSizeMB,
      allowedFormats: ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'],
      allowOriginalAudio,
      allowComments,
      allowDownloads
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sliders size={18} />
            </div>
            <h3 className="font-extrabold text-base">রিল সেটিংস ও ভিডিও পলিসি (অ্যাডমিন)</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer border-0"
          >
            <X size={18} />
          </button>
        </div>

        {isSaved ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <Check size={40} className="text-emerald-400 mb-2" />
            <p className="font-bold text-emerald-400">পলিসি ও সেটিংস আপডেট হয়েছে</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-300 mb-1">
                সর্বোচ্চ ভিডিও দৈর্ঘ্য (সেকেন্ড): {maxDuration}s
              </label>
              <input 
                type="range" 
                min={15} 
                max={180} 
                step={5}
                value={maxDuration}
                onChange={(e) => setMaxDuration(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>১৫ সে.</span>
                <span>৬০ সে.</span>
                <span>৯০ সে.</span>
                <span>১৮০ সে.</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-300 mb-1">
                সর্বোচ্চ ফাইল সাইজ (MB): {maxFileSizeMB} MB
              </label>
              <input 
                type="range" 
                min={10} 
                max={200} 
                step={10}
                value={maxFileSizeMB}
                onChange={(e) => setMaxFileSizeMB(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>১০ MB</span>
                <span>৬০ MB</span>
                <span>১০০ MB</span>
                <span>২০০ MB</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-white/5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-300">ইউজারের অরিজিনাল অডিও অনুমোদন</span>
                <input 
                  type="checkbox"
                  checked={allowOriginalAudio}
                  onChange={(e) => setAllowOriginalAudio(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-300">ভিডিওতে কমেন্ট সেকশন চালু</span>
                <input 
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-300">ভিডিও ডাউনলোড করার অনুমতি</span>
                <input 
                  type="checkbox"
                  checked={allowDownloads}
                  onChange={(e) => setAllowDownloads(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-slate-300 rounded-2xl text-xs font-black transition-colors cursor-pointer border-0"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black transition-colors cursor-pointer border-0 shadow-lg shadow-emerald-600/30"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertTriangle, KeyRound, X } from 'lucide-react';

interface Security2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  actionTitle: string;
  actionDescription: string;
  isSensitive?: boolean;
}

export const Security2FAModal: React.FC<Security2FAModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  actionTitle,
  actionDescription,
  isSensitive = true
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.trim().length < 4) {
      setError('দয়া করে আপনার ৪ থেকে ৬ ডিজিটের সিকিউরিটি PIN বা পাসওয়ার্ড দিন');
      return;
    }
    setError('');
    onConfirm(pin.trim());
    setPin('');
  };

  return (
    <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2.5 rounded-2xl ${isSensitive ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">2FA সিকিউরিটি ভেরিফিকেশন</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">অ্যাডমিন টু-ফ্যাক্টর প্রমানীকরণ</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {isSensitive && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-start gap-3 mb-4">
            <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-rose-800 font-medium">
              <strong className="font-bold block text-rose-900 mb-0.5">সংবেদনশীল কাজ (Sensitive Action):</strong>
              {actionDescription}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <KeyRound size={14} className="text-emerald-600" />
              সিকিউরিটি PIN বা অ্যাডমিন পাসওয়ার্ড
            </label>
            <input
              type="password"
              maxLength={12}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              placeholder="••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              autoFocus
            />
            {error && <p className="text-xs font-bold text-rose-500 mt-1">{error}</p>}
          </div>

          <div className="text-[11px] text-slate-400 font-medium text-center">
            🔒 এই কর্মকাণ্ডটি সিস্টেমের সিকিউরিটি অডিট লগ (Audit Log)-এ স্থায়ীভাবে রেকর্ড করা হবে।
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs hover:bg-slate-200 transition-colors"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 px-4 font-black rounded-2xl text-xs text-white shadow-lg transition-all ${
                isSensitive 
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              নিশ্চিত করুন ({actionTitle})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

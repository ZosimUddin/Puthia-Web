import React from 'react';
import { motion } from 'motion/react';
import { X, Copy, Check, Facebook, MessageCircle, Send } from 'lucide-react';

interface ShareModalProps {
  title: string;
  url: string;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  title,
  url,
  onClose,
  onShowToast
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onShowToast("লিংক কপি হয়েছে");
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      onShowToast("লিংক কপি করতে ব্যর্থ হয়েছে");
    }
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] text-white',
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'Messenger',
      icon: MessageCircle,
      color: 'bg-[#0084FF] text-white',
      link: `fb-messenger://share/?link=${encodeURIComponent(url)}`
    },
    {
      name: 'WhatsApp',
      icon: Send,
      color: 'bg-[#25D366] text-white',
      link: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`
    }
  ];

  return (
    <div className="fixed inset-0 z-[10009] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[28px] w-full max-w-md shadow-2xl p-6 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-black text-slate-800">শেয়ার করুন</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs font-bold text-slate-500 line-clamp-1">{title}</p>

        <div className="grid grid-cols-3 gap-3">
          {shareOptions.map((opt) => (
            <a
              key={opt.name}
              href={opt.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${opt.color} group-hover:scale-110 transition-transform`}>
                <opt.icon size={22} />
              </div>
              <span className="text-xs font-black text-slate-700">{opt.name}</span>
            </a>
          ))}
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">লিংক কপি করুন</label>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <input 
              readOnly 
              value={url} 
              className="w-full bg-transparent text-xs font-bold text-slate-600 px-3 outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 hover:bg-emerald-700 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'কপি হয়েছে' : 'কপি'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

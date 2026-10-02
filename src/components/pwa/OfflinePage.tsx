import React from 'react';
import { WifiOff, Home, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const OfflinePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md w-full"
      >
        <div className="mb-8 relative flex justify-center">
          <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500 relative z-10">
            <WifiOff size={48} />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-rose-100 rounded-full blur-2xl"
          />
        </div>

        <h1 className="text-2xl font-black text-emerald-950 mb-4">
          আপনি অফলাইনে আছেন
        </h1>
        <p className="text-gray-500 font-bold mb-8 leading-relaxed">
          আপনার ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়ে গেছে। আমাদের পুঠিয়া-র অফলাইন ভার্সন লোড করতে পুনরায় চেষ্টা করুন।
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95"
          >
            <RefreshCw size={20} />
            <span>রিলোড করুন</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-100"
          >
            <Home size={20} />
            <span>হোম</span>
          </button>
        </div>

        <div className="mt-12 pt-12 border-t border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            আমাদের পুঠিয়া - ডিজিটাল সেবা
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OfflinePage;

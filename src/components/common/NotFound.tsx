import React from "react";
import { motion } from "motion/react";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <span className="text-[120px] font-black text-emerald-100 leading-none">404</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xl font-bold text-slate-800">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</p>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 mb-8"
        >
          দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন তা সরিয়ে ফেলা হয়েছে অথবা বর্তমানে অনুপলব্ধ। 
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-4"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
          >
            <Home size={20} />
            হোম পেজে ফিরে যান
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 bg-white text-slate-600 py-4 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
            আগের পৃষ্ঠায় যান
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;

import React, { useState } from "react";
import { RotateCcw, Download, Upload, Server, Database, CheckCircle, AlertCircle } from "lucide-react";

const BackupRestore = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackup, setLastBackup] = useState('আজ সকাল ১০:০০');

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      setLastBackup('এইমাত্র');
    }, 2000);
  };

  const handleRestore = () => {
    setIsRestoring(true);
    setTimeout(() => {
      setIsRestoring(false);
      alert('সিস্টেম রিস্টোর সফলভাবে সম্পন্ন হয়েছে!');
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-1">ব্যাকআপ ও রিস্টোর (Backup & Restore)</h2>
        <p className="text-sm font-bold text-gray-400">সিস্টেম ডেটা সুরক্ষিত রাখুন এবং পূর্ববর্তী অবস্থায় ফিরে যান</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[24px] flex items-center justify-center mb-6">
            <Download size={32} />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">সিস্টেম ব্যাকআপ</h3>
          <p className="text-sm font-bold text-gray-500 mb-6">সম্পূর্ণ সিস্টেম ডেটাবেস এবং ফাইল সুরক্ষিতভাবে ব্যাকআপ নিন</p>
          
          <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-gray-500 flex items-center gap-2"><Database size={16} /> শেষ ব্যাকআপ:</span>
              <span className="font-black text-emerald-600">{lastBackup}</span>
            </div>
          </div>

          <button 
            onClick={handleBackup}
            disabled={isBackingUp}
            className={`w-full py-4 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-2 ${isBackingUp ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200'}`}
          >
            {isBackingUp ? (
              <span className="animate-pulse">ব্যাকআপ হচ্ছে...</span>
            ) : (
              <>ব্যাকআপ তৈরি করুন <Download size={18} /></>
            )}
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[24px] flex items-center justify-center mb-6">
            <RotateCcw size={32} />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">সিস্টেম রিস্টোর</h3>
          <p className="text-sm font-bold text-gray-500 mb-6">পূর্ববর্তী ব্যাকআপ ফাইল আপলোড করে সিস্টেম রিস্টোর করুন</p>
          
          <div className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-4 mb-6 relative hover:border-emerald-500 hover:bg-emerald-50/30 transition-colors group cursor-pointer">
             <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".json,.sql,.zip" />
             <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                 <Upload size={24} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                 <span className="text-sm font-bold text-gray-500 group-hover:text-emerald-600">ব্যাকআপ ফাইল সিলেক্ট করুন</span>
             </div>
          </div>

          <button 
            onClick={handleRestore}
            disabled={isRestoring}
            className={`w-full py-4 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-2 ${isRestoring ? 'bg-rose-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200'}`}
          >
             {isRestoring ? (
              <span className="animate-pulse">রিস্টোর হচ্ছে...</span>
            ) : (
              <>সিস্টেম রিস্টোর করুন <RotateCcw size={18} /></>
            )}
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4">
        <AlertCircle className="text-amber-500 shrink-0 mt-1" size={24} />
        <div>
          <h4 className="text-sm font-black text-amber-800 mb-1">সতর্কতা</h4>
          <p className="text-xs font-bold text-amber-700/80 leading-relaxed">
            সিস্টেম রিস্টোর করার সময় সাইট সাময়িকভাবে ডাউন থাকতে পারে। নিশ্চিত করুন যে আপনার নির্বাচিত ব্যাকআপ ফাইলটি সঠিক এবং সম্পূর্ণ। রিস্টোর করার আগে বর্তমান অবস্থার একটি নতুন ব্যাকআপ নিয়ে রাখা ভালো।
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;

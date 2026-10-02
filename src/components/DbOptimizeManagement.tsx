import React, { useState } from 'react';
import { Database, Zap, CheckCircle } from 'lucide-react';

export default function DbOptimizeManagement() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setIsOptimized(true);
    }, 2000);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">ডেটাবেস অপটিমাইজেশন (Database Optimize)</h3>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">অপ্রয়োজনীয় ক্যাশ ক্লিয়ার এবং ডেটাবেস ইনডেক্সিং অপটিমাইজ করে সিস্টেমের পারফরম্যান্স বৃদ্ধি করুন</p>
        
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-colors duration-500 ${isOptimized ? 'border-green-500 bg-green-500/10' : 'border-blue-500 bg-blue-500/10'}`}>
              {isOptimizing ? (
                <Zap className="w-12 h-12 text-blue-400 animate-pulse" />
              ) : isOptimized ? (
                <CheckCircle className="w-12 h-12 text-green-400" />
              ) : (
                <Database className="w-12 h-12 text-blue-400" />
              )}
            </div>
            {isOptimizing && (
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-400 border-transparent animate-spin"></div>
            )}
          </div>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <button 
            onClick={handleOptimize}
            disabled={isOptimizing || isOptimized}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isOptimized ? 'bg-green-600 text-white cursor-not-allowed' :
              isOptimizing ? 'bg-blue-600/50 text-white cursor-wait' :
              'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <Zap className="w-5 h-5" />
            {isOptimizing ? 'অপটিমাইজ করা হচ্ছে...' : isOptimized ? 'সফলভাবে অপটিমাইজড' : 'এখনই অপটিমাইজ করুন'}
          </button>

          {isOptimized && (
            <p className="text-sm text-green-400">ডেটাবেস অপটিমাইজেশন সফল হয়েছে। সিস্টেম পারফরম্যান্স স্বাভাবিক।</p>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { ArrowLeft, Download, RefreshCcw, QrCode, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";

interface Props { onGoBack: () => void; }

export const DigitalIdCard: React.FC<Props> = ({ onGoBack }) => {
  const { user, userProfile } = useAuth();
  const [flipped, setFlipped] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Dynamic values or elegant fallbacks
  const name = user ? userProfile?.name || "সম্মানিত নাগরিক" : "জসিম উদ্দিন";
  const bloodGroup = user ? userProfile?.bloodGroup || "O+" : "O+";
  const location = user ? `${userProfile?.village || "জিউপাড়া"}, ${userProfile?.union || "পুঠিয়া"}` : "জিউপাড়া, পুঠিয়া";
  const idNumber = user ? `PUT-${userProfile?.uid?.substring(0, 6).toUpperCase() || "8745"}` : "PUT-8745";
  const joinDate = user ? new Date(userProfile?.createdAt || Date.now()).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : "২২ আগস্ট ২০২৬";

  const handleDownload = () => {
    window.alert("আপনার ডিজিটাল নাগরিক পরিচিতি কার্ড ডাউনলোড করার ফাইল তৈরি হচ্ছে... অনুগ্রহ করে ২ সেকেন্ড অপেক্ষা করুন।");
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #1e3a24, #122819)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <p className="text-emerald-500 text-sm font-medium mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 animate-pulse" /> স্মার্ট নাগরিক প্রোফাইল
          </p>
          <h1 className="text-3xl md:text-4xl font-black mb-1 text-white">ডিজিটাল নাগরিক কার্ড</h1>
          <div className="w-10 h-1 bg-amber-400 rounded-full my-3"></div>
          <p className="text-gray-200 text-sm leading-relaxed max-w-lg">
            আমাদের পুঠিয়া অ্যাপের ভেরিফাইড নাগরিক হিসেবে আপনার নিজস্ব কাস্টম ডিজিটাল আইডি কার্ড তৈরি ও ডাউনলোড করুন।
          </p>
        </div>
      </div>

      {!user && (
        <div className="bg-amber-50 dark:bg-zinc-800/40 border border-amber-200 dark:border-zinc-700 rounded-2xl p-4 text-center space-y-2.5 mx-4">
          <p className="text-xs text-amber-800 dark:text-gray-300 font-bold leading-relaxed">
            আপনি বর্তমানে অতিথি হিসেবে কার্ড দেখছেন। আপনার নিজস্ব তথ্যযুক্ত ভেরিফাইড আইডি কার্ড পেতে লগইন বা নিবন্ধন করুন।
          </p>
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-[#125836] text-xs font-bold rounded-xl transition shadow-md"
          >
            অ্যাকাউন্ট লগইন / নিবন্ধন
          </button>
        </div>
      )}

      <div className="px-4 space-y-4">
        {/* Card Wrap */}
        <div 
          className="relative w-full aspect-[1.6/1] cursor-pointer perspective-1000 max-w-md mx-auto"
          onClick={() => setFlipped(!flipped)}
        >
          <div className={`w-full h-full transition-transform duration-700 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front */}
            <div 
              className="absolute w-full h-full backface-hidden rounded-2xl p-5 shadow-xl border border-white/10 flex flex-col justify-between"
              style={{ background: "linear-gradient(135deg, rgba(18, 88, 54, 0.95), rgba(12, 40, 25, 0.98))", backdropFilter: "blur(10px)" }}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-emerald-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-lg font-black text-white">{name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white leading-tight">{name}</h3>
                    <p className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">ভেরিফাইড নাগরিক</p>
                  </div>
                </div>
                <QrCode className="w-10 h-10 text-white/40" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-emerald-100"><span className="text-white/60">রক্তের গ্রুপ:</span> <span className="text-emerald-500 font-bold">{bloodGroup}</span></p>
                <p className="text-xs font-medium text-emerald-100"><span className="text-white/60">গ্রাম/এলাকা:</span> {location}</p>
              </div>
            </div>

            {/* Back */}
            <div 
              className="absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl p-5 shadow-xl border border-white/10 flex flex-col justify-center items-center text-center"
              style={{ background: "linear-gradient(135deg, rgba(12, 40, 25, 0.98), rgba(6, 20, 12, 0.99))", backdropFilter: "blur(10px)" }}
            >
               <div className="w-full flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4">
                  <p className="text-[11px] text-white/50 mb-1">মেম্বারশিপ আইডি</p>
                  <p className="text-lg font-black text-emerald-500 tracking-widest mb-3 font-mono">{idNumber}</p>
                  
                  <p className="text-[10px] text-white/40 mb-1">ইস্যু ডেট: {joinDate}</p>
                  <div className="mt-2 text-[9px] font-bold text-white/20 uppercase tracking-widest border-t border-white/10 pt-2 w-full">
                    Official Puthia Portal Seal
                  </div>
               </div>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-center text-gray-400 font-bold">কার্ডের পিছনের অংশ দেখতে কার্ডে ট্যাপ করুন</p>
        
        <div className="flex gap-2 w-full max-w-md mx-auto pt-2">
          <button 
            onClick={handleDownload}
            className="flex-1 py-3 text-xs font-bold text-[#125836] bg-amber-400 rounded-xl hover:bg-amber-500 transition-colors shadow-md shadow-amber-400/20 flex items-center justify-center gap-1.5 outline-none cursor-pointer"
          >
            <Download className="w-4 h-4" /> ডাউনলোড করুন
          </button>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

import React, { useState } from "react";
import { ArrowLeft, Map, Globe, Download } from "lucide-react";

interface Props { onGoBack: () => void; }

export const OfficialMaps: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"admin" | "live">("admin");

  return (
    <div className="space-y-6 font-sans pb-10">
      <div 
        className="relative w-full h-48 rounded-b-3xl flex flex-col justify-center p-8 shadow-lg overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4A0E17, #721C24)" }}
      >
        <button
          onClick={onGoBack}
          className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="mt-6 flex flex-col items-center text-center">
          <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-[11px] font-extrabold rounded-full mb-2 backdrop-blur-md tracking-wider border border-[#D4AF37]/30 uppercase">
            ডিজিটাল গাইড
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-md mb-1 serif-font">
            পুঠিয়া উপজেলার মানচিত্র
          </h1>
          <p className="text-red-100/90 text-xs font-medium max-w-[280px]">
            পুঠিয়ার প্রশাসনিক এলাকা ও ইউনিয়নগুলোর সীমানা চিহ্নিত ডিজিটাল গাইড ম্যাপ।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("admin")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm ${
              filter === "admin"
                ? "bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37]/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Map className={`w-4 h-4 ${filter === "admin" ? 'text-[#D4AF37]' : 'text-gray-400'}`}/>
            প্রশাসনিক ম্যাপ
          </button>
          <button
            onClick={() => setFilter("live")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm ${
              filter === "live"
                ? "bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37]/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Globe className={`w-4 h-4 ${filter === "live" ? 'text-[#D4AF37]' : 'text-gray-400'}`}/>
            গুগল লাইভ ম্যাপ
          </button>
        </div>

        <div className="space-y-4">
          {filter === "admin" && (
            <div className="bg-[#FAF8F5] rounded-2xl p-4 shadow-lg border border-[#E8DFC9] flex flex-col gap-3 relative animate-fade-in group">
              <div className="w-full h-64 bg-[#E8DFC9] rounded-xl flex items-center justify-center relative overflow-hidden">
                 <Map className="w-16 h-16 text-[#A89F8B] absolute" />
                 <span className="text-xs font-bold text-[#A89F8B] mt-24">মানচিত্র লোড হচ্ছে...</span>
              </div>
              
              <a 
                href="/map_puthia.jpg"
                download
                target="_blank"
                className="w-full mt-2 py-3 text-xs font-bold text-[#4A0E17] bg-[#D4AF37] rounded-xl hover:bg-[#E5C251] transition-colors shadow-md flex items-center justify-center gap-1.5 outline-none tracking-wider"
              >
                <Download className="w-4 h-4" /> ম্যাপ ডাউনলোড করুন
              </a>
            </div>
          )}
          {filter === "live" && (
             <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 animate-fade-in shadow-lg">
                <iframe
                  title="Puthia Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d116668.6117621111!2d88.75549019864273!3d24.375253164998877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fbf25a66a1e3dd%3A0x6b74e64573177f0d!2sPuthia!5e0!3m2!1sen!2sbd!4v1718899888888!5m2!1sen!2sbd"
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
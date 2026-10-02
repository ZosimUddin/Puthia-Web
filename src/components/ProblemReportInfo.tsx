import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowLeft, Edit3, Grid, FileText, MapPin, Camera, AlertTriangle, ShieldCheck } from "lucide-react";

export function ProblemReportInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("new_report");
  const [agreed, setAgreed] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [loc, setLoc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const onSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!title || !category || !desc || !loc) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "complaints"), {
        title, category, details: desc, location: loc,
        createdAt: serverTimestamp()
      });
      setShowToast(true);
      setTitle(""); setCategory(""); setDesc(""); setLoc("");
      setTimeout(() => { setShowToast(false); onGoBack(); }, 3000);
    } catch(err) {
      console.error(err);
      alert("Failed rules");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans space-y-6 pb-6">
      {/* Hero Banner Section */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #4A148C, #7B1FA2)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">সচেতন নাগরিক, সমৃদ্ধ পুঠিয়া</p>
          <h1 className="text-4xl font-black mb-3 text-white">সমস্যা রিপোর্ট করুন</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
            আপনার এলাকার রাস্তাঘাট, বিদ্যুৎ, পানি বা যেকোনো জনদুর্ভোগের কথা সরাসরি জানান। উপযুক্ত প্রমাণসহ রিপোর্ট জমা দিয়ে পুঠিয়ার উন্নয়নে অংশ নিন।
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Quick Select Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('new_report')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'new_report' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🗺️</span> নতুন রিপোর্ট
        </button>
        <button 
          onClick={() => setActiveTab('recent_problems')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'recent_problems' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">⏱️</span> সাম্প্রতিক সমস্যা
        </button>
        <button 
          onClick={() => setActiveTab('guidelines')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'guidelines' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📋</span> গাইডলাইন ও নিয়ম
        </button>
        <button 
          onClick={() => setActiveTab('emergency_helpline')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'emergency_helpline' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📞</span> জরুরি হেল্পলাইন
        </button>
      </div>

      {/* Main Problem Report Form */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#4A148C]"></div>
        
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-purple-50 rounded-lg text-[#8E24AA]">
             <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">সমস্যার বিবরণ ও তথ্য</h2>
        </div>

        <form onSubmit={onSimulateSubmit} className="space-y-5">
          {showToast && <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-md animate-pulse z-10">Success! ✅</div>}
          
          {/* Report Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 block">১. সমস্যার শিরোনাম</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Edit3 className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                required
                value={title || ""} onChange={e => setTitle(e.target.value)}
                placeholder="উদাঃ ভাঙা কালভার্ট বা ড্রেনেজ সমস্যা" 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E24AA]/20 focus:border-[#8E24AA] transition-all duration-200"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 block">২. সমস্যার ধরন</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Grid className="w-4 h-4" />
              </div>
              <select 
                required
                value={category || ""} onChange={e => setCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E24AA]/20 focus:border-[#8E24AA] transition-all duration-200 appearance-none font-medium text-gray-700"
              >
                <option value="">নির্বাচন করুন...</option>
                <option value="road">রাস্তাঘাট</option>
                <option value="electricity">বিদ্যুৎ</option>
                <option value="water">পানি/পয়ঃনিষ্কাশন</option>
                <option value="waste">ময়লা-আবর্জনা</option>
                <option value="other">অন্যান্য</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 block">৩. বিস্তারিত বিবরণ</label>
            <div className="relative">
              <div className="absolute top-3.5 left-0 pl-3.5 flex items-start pointer-events-none text-gray-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea 
                required
                rows={4}
                value={desc || ""} onChange={e => setDesc(e.target.value)}
                placeholder="সমস্যাটি সম্পর্কে বিস্তারিত লিখুন এবং এটি কোথায় অবস্থিত তা উল্লেখ করুন..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E24AA]/20 focus:border-[#8E24AA] transition-all duration-200 resize-none"
              ></textarea>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 block">৪. সঠিক এলাকা/লোকেশন</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <MapPin className="w-4 h-4" />
              </div>
              <select 
                required
                value={loc || ""} onChange={e => setLoc(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E24AA]/20 focus:border-[#8E24AA] transition-all duration-200 appearance-none font-medium text-gray-700"
              >
                <option value="">এলাকা নির্বাচন করুন...</option>
                <option value="puthia_pourosova">পুঠিয়া পৌরসভা</option>
                <option value="baneswar">বানেশ্বর</option>
                <option value="jiupara">জিউপাড়া</option>
                <option value="shilmaria">শিলমাড়িয়া</option>
                <option value="bhalukgachi">ভালুকগাছী</option>
                <option value="other">অন্যান্য</option>
              </select>
            </div>
          </div>

          {/* Attach Image */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 block">৫. ছবি/প্রমাণ আপলোড <span className="text-gray-400 font-normal text-xs">(ঐচ্ছিক)</span></label>
            <div className="relative">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-bold">সমস্যার একটি বা দুটি ছবি যুক্ত করুন</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (Max. 5MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" multiple />
              </label>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="pt-4 mt-2">
             <div className="flex items-start gap-2 bg-purple-50 p-3.5 rounded-xl border border-purple-100">
                <ShieldCheck className="w-5 h-5 text-[#8E24AA] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  <span className="font-bold">গোপনীয়তা নোট:</span> আপনার দেওয়া নাম ও মোবাইল নম্বর শুধুমাত্র সত্যতা যাচাইয়ের জন্য রাখা হবে, এটি পাবলিকলি প্রকাশ করা হবে না।
                </p>
             </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" disabled={isSubmitting}
            className="w-full bg-[#4A148C] hover:bg-[#7B1FA2] text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-2"
          >
            রিপোর্টটি কর্তৃপক্ষের উদ্দেশ্যে জমা দিন
          </button>
        </form>

      </div>
    </div>
  );
}

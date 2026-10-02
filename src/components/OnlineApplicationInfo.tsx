import React, { useState } from "react";
import { ArrowLeft, ExternalLink, Download, Send } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { ServiceApplicationForm } from "./ServiceApplicationForm";

export function OnlineApplicationInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("all_applications");
  const [showApplyForm, setShowApplyForm] = useState<"charity_allowance" | "citizen_certificate" | null>(null);

  const onSimulateLink = (title: string) => {
    alert(`Opening ${title} in browser... (Simulated)`);
  };

  return (
    <div className="font-sans space-y-6 pb-6">
      {/* Hero Banner Section */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #B71C1C, #424242)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">সমন্বিত ডিজিটাল সরকারি ফরম ও আবেদন</p>
          <h1 className="text-4xl font-black mb-3 text-white">অনলাইন আবেদন হাব</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             বাংলাদেশ সরকারের বিভিন্ন পাবলিক পোর্টাল, সামাজিক নিরাপত্তা বেষ্টনীর ভাতা, ড্রাইভিং লাইসেন্স, এবং পুঠিয়া উপজেলার নাগরিকদের জন্য প্রযোজ্য সকল অনলাইন ফর্মের ডিরেক্টরি।
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Category Filter Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('all_applications')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'all_applications' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">💻</span> সব আবেদন
        </button>
        <button 
          onClick={() => setActiveTab('social_allowance')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'social_allowance' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">👴</span> সামাজিক ভাতা
        </button>
        <button 
          onClick={() => setActiveTab('license_cert')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'license_cert' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🚗</span> লাইসেন্স ও সার্টিফিকেট
        </button>
        <button 
          onClick={() => setActiveTab('forms_download')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'forms_download' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📄</span> সরকারি ফরম ডাউনলোড
        </button>
      </div>

      {/* Main Application Feed */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               👴
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">বয়স্ক, বিধবা ও প্রতিবন্ধী ভাতা আবেদন</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">সামাজিক নিরাপত্তা ভাতা (Social Safety Net Allowance)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📂</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">প্রয়োজনীয় কাগজপত্র:</span> অনলাইন জন্ম নিবন্ধন বা এনআইডি (NID), পাসপোর্ট সাইজ ছবি, সচল মোবাইল নম্বর (নগদ/বিকাশ অ্যাকাউন্টসহ) এবং প্রতিবন্ধী ভাতার ক্ষেত্রে সমাজসেবা অফিসের সুবর্ণ কার্ড।</p>
             </div>
          </div>
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               পুঠিয়া উপজেলার সমাজসেবা অধিদপ্তরের আওতাধীন যোগ্য নাগরিকদের জন্য সরকারি ভাতার অনলাইন পোর্টাল। এখান থেকে নতুন ভাতার জন্য নাম অন্তর্ভুক্তির আবেদন করা যাবে।
             </p>
          </div>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setShowApplyForm("charity_allowance")}
              className="text-sm font-bold text-white flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-5 py-3.5 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Send className="w-4 h-4" /> পোর্টাল থেকে সরাসরি আবেদন
            </button>
            <button 
              onClick={() => onSimulateLink('Social Allowance Portal')}
              className="text-sm font-bold text-gray-700 flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-3.5 rounded-xl transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" /> সরকারি সামাজিক ভাতা পোর্টাল
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               🚗
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">বিআরটিএ (BRTA) লার্নার ও ড্রাইভিং লাইসেন্স</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">ই-ড্রাইভিং লাইসেন্স আবেদন (e-Driving License - BRTA)</div>
            </div>
          </div>
          
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               এখন ঘরে বসেই বিআরটিএ-এর 'BSP' পোর্টালে প্রোফাইল খুলে শিক্ষানবিস (Learner) ড্রাইভিং লাইসেন্সের আবেদন, ফি প্রদান এবং পরীক্ষার স্লট বুকিং করা যায়। পরীক্ষা পাসের পর মূল লাইসেন্সের জন্য অনলাইনেই স্মার্ট আবেদন করা যাবে।
             </p>
          </div>
          <div className="mt-5">
            <button 
              onClick={() => onSimulateLink('BRTA BSP Portal')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-5 py-3.5 rounded-xl transition"
            >
              <ExternalLink className="w-4 h-4" /> বিআরটিএ সেবা পোর্টাল
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               📄
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">ই-টিন (e-TIN) সার্টিফিকেট ও সাধারণ ফরম</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">সরকারি ফরম ও সার্টিফিকেট (e-TIN & Forms)</div>
            </div>
          </div>
          
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               ব্যবসা, লোন বা ট্যাক্স রিটার্ন জমার জন্য প্রয়োজনীয় ১০ ডিজিটের ই-টিন (TIN) সার্টিফিকেট মাত্র ২ মিনিটে জেনারেট করুন। এছাড়াও সরকারের সর্বজনীন 'বাংলাদেশ ফরম' পোর্টাল থেকে যেকোনো অফলাইন সরকারি কাজের পিডিএফ (PDF) ফরম ডাউনলোড করতে পারবেন।
             </p>
          </div>
          
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setShowApplyForm("citizen_certificate")}
              className="text-sm font-bold text-white flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-5 py-3.5 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Send className="w-4 h-4" /> নাগরিক প্রত্যয়নপত্র সরাসরি আবেদন
            </button>
            <button 
              onClick={() => onSimulateLink('e-TIN and Forms Portal')}
              className="text-sm font-bold text-gray-700 flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-3.5 rounded-xl transition cursor-pointer"
            >
              <Download className="w-4 h-4" /> ই-টিন ও ফরম ডাউনলোড
            </button>
          </div>
        </div>

      </div>
      <AnimatePresence>
        {showApplyForm === "charity_allowance" && (
          <ServiceApplicationForm 
            serviceType="charity_allowance" 
            serviceName="সামাজিক নিরাপত্তা ভাতা" 
            onClose={() => setShowApplyForm(null)} 
          />
        )}
        {showApplyForm === "citizen_certificate" && (
          <ServiceApplicationForm 
            serviceType="citizen_certificate" 
            serviceName="নাগরিকত্ব প্রত্যয়নপত্র" 
            onClose={() => setShowApplyForm(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

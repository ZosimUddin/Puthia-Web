import React, { useState } from "react";
import { ArrowLeft, Phone, Globe, Camera, Edit3, Search } from "lucide-react";

export function ComplaintStatusInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("tab1");

  const onSimulateAction = (actionName: string) => {
    alert(`${actionName}... (Simulated)`);
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
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">স্বচ্ছতা ও জবাবদিহিতা</p>
          <h1 className="text-4xl font-black mb-3 text-white">অভিযোগের বর্তমান অবস্থা</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             আপনার সাবমিট করা টিকিট বা কমপ্লেইন আইডি নম্বর দিয়ে অভিযোগের অগ্রগতি এবং সমাধান লাইভ ট্র্যাক করুন।
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Quick Select Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('tab1')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab1' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🔍</span> স্ট্যাটাস চেক
        </button>
        <button 
          onClick={() => setActiveTab('tab2')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab2' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🟡</span> চলমান (Pending)
        </button>
        <button 
          onClick={() => setActiveTab('tab3')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab3' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🟢</span> সমাধানকৃত
        </button>
        <button 
          onClick={() => setActiveTab('tab4')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab4' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🔴</span> বাতিলকৃত
        </button>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#4A148C]"></div>
          <div className="flex gap-4 items-start pl-2">
            <div className="w-16 h-16 rounded-full bg-[#4A148C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#4A148C]/20">
               🔍
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">কমপ্লেইন ট্র্যাকিং বক্স</h4>
              <p className="text-sm mt-1 text-gray-500 font-medium">আপনার মোবাইলে আসা 'Complaint ID' টি নিচের বক্সে লিখে সার্চ করুন।</p>
            </div>
          </div>
          
          <div className="mt-4 bg-[bg-purple-50] p-4 rounded-2xl border border-purple-100 ml-2">
             <div className="relative">
              <input 
                type="text" 
                placeholder="কমপ্লেইন আইডি লিখুন (উদাঃ PC-1024)" 
                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A148C]/20 focus:border-[#4A148C] transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-5 pl-2">
            <button 
              onClick={() => onSimulateAction('Checking status')}
              className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#4A148C] hover:bg-[#7B1FA2] px-4 py-3.5 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <Search className="w-4 h-4" /> লাইভ অবস্থা দেখুন
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

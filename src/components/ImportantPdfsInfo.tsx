import React, { useState } from "react";
import { ArrowLeft, MapPin, Phone, BookOpen, Clock, Calendar, Users, Info, Download, FileText, FileDown } from "lucide-react";

export function ImportantPdfsInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("tab1");

  const onSimulateAction = (actionName: string) => {
    alert(`${actionName}... (Simulated)`);
  };

  return (
    <div className="font-sans space-y-6 pb-6">
      
      {/* Hero Banner Section */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #004D40, #00796B)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-[#4DB6AC] text-sm font-bold mb-2 uppercase tracking-wide">অফিশিয়াল গেজেট ও নোটিশ</p>
          <h1 className="text-4xl font-black mb-3 text-white">গুরুত্বপূর্ণ PDF ডিরেক্টরি</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-[#4DB6AC]/50 pl-3 py-1">
             সরকারি গুরুত্বপূর্ণ নোটিশ, পুঠিয়া উপজেলার স্থানীয় গেজেট এবং সিটিজেন চার্টারের অফিশিয়াল ফাইলসমূহ।
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
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab1' ? 'bg-[#00897B] text-white border-[#00897B] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📂</span> জরুরি নোটিশ
        </button>
        <button 
          onClick={() => setActiveTab('tab2')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab2' ? 'bg-[#00897B] text-white border-[#00897B] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📜</span> সিটিজেন চার্টার
        </button>
        <button 
          onClick={() => setActiveTab('tab3')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab3' ? 'bg-[#00897B] text-white border-[#00897B] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🏛️</span> উপজেলা বাজেট
        </button>
        <button 
          onClick={() => setActiveTab('tab4')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab4' ? 'bg-[#00897B] text-white border-[#00897B] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📑</span> অন্যান্য নির্দেশিকা
        </button>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#00897B]"></div>
          <div className="flex gap-4 items-start pl-2">
            <div className="w-16 h-16 rounded-full bg-[#00897B]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#00897B]/20">
               📜
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">পুঠিয়া উপজেলা সিটিজেন চার্টার (সেবা নির্দেশিকা)</h4>
              <p className="text-sm mt-1 text-gray-600 font-medium flex items-center gap-1.5"><FileText className="w-4 h-4 shrink-0 text-gray-400"/> PDF <span className="text-gray-300">|</span> ২.৪ MB</p>
            </div>
          </div>
          
          <div className="mt-4 bg-[bg-teal-50] p-4 rounded-2xl border border-teal-100 ml-2">
             <p className="text-sm text-gray-700 font-sans leading-relaxed">
               <span className="font-bold text-[#00897B] block mb-1">📝 বিবরণ:</span> 
               কোন সরকারি অফিসে কোন সেবা কত দিনে এবং কত ফি-তে পাওয়া যাবে, তার বিস্তারিত অফিশিয়াল গাইডলাইন।
             </p>
          </div>

          <div className="mt-5 pl-2">
            <a 
              href="/citizen_charter.pdf"
              target="_blank"
              download
              className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#00897B] hover:bg-[#00695C] px-4 py-3.5 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <FileDown className="w-5 h-5" /> গাইড ডাউনলোড করুন
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}

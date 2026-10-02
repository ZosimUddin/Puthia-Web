import React, { useState } from 'react';

export const AgriOfficersInfo = ({ onGoBack }: { onGoBack: () => void }) => {
  const [activeTab, setActiveTab] = useState("all");

  const onSimulateCall = (number: string, title: string) => {
    alert(`Calling ${title} at ${number}... (Simulated)`);
  };

  return (
    <div className="font-sans space-y-6">
      {/* Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #004D40, #4CAF50)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-white text-sm font-bold mb-2 uppercase tracking-wide">সরকারি কৃষি সেবা ও পরামর্শ</p>
          <h1 className="text-4xl font-black mb-3 text-white">কৃষি কর্মকর্তা ডিরেক্টরি</h1>
          <p className="text-gray-50 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white pl-3 py-1">
             পুঠিয়া উপজেলা কৃষি অফিস এবং বিভিন্ন ইউনিয়নের দায়িত্বপ্রাপ্ত উপ-সহকারী কৃষি কর্মকর্তাদের সরকারি যোগাযোগ নম্বর ও অফিসের ঠিকানা।
          </p>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'all' ? 'bg-[#4CAF50] text-white border-[#4CAF50] shadow-md' : 'bg-white text-gray-700 border-gray-100'}`}
        >
          <span className="text-2xl">📞</span> সব কর্মকর্তা
        </button>
        <button 
          onClick={() => setActiveTab('upazila')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'upazila' ? 'bg-[#4CAF50] text-white border-[#4CAF50] shadow-md' : 'bg-white text-gray-700 border-gray-100'}`}
        >
          <span className="text-2xl">🏢</span> উপজেলা অফিস
        </button>
        <button 
          onClick={() => setActiveTab('union')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'union' ? 'bg-[#4CAF50] text-white border-[#4CAF50] shadow-md' : 'bg-white text-gray-700 border-gray-100'}`}
        >
          <span className="text-2xl">🌾</span> ইউনিয়ন পর্যায়
        </button>
        <button 
          onClick={() => setActiveTab('plant')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'plant' ? 'bg-[#4CAF50] text-white border-[#4CAF50] shadow-md' : 'bg-white text-gray-700 border-gray-100'}`}
        >
          <span className="text-2xl">🏥</span> উদ্ভিদ সংরক্ষণ
        </button>
      </div>

      {/* Officer Contact Feed section */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition hover:border-[#004D40]/20">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#4CAF50] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#A5D6A7]">
               🏢
            </div>
            <div>
              <h4 className="font-serif font-black text-[#004D40] text-xl leading-tight mb-1">উপজেলা কৃষি অফিসার (UAO)</h4>
              <p className="text-sm text-[#4CAF50] font-bold mt-1">উপজেলা কৃষি অফিস (Top Head)</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">💼</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#004D40]">পদবি:</span> বিসিএস (কৃষি), উপজেলা কৃষি অফিস, পুঠিয়া।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#004D40]">অফিস লোকেশন:</span> উপজেলা পরিষদ চত্বর, পুঠিয়া সদর।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📩</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#004D40]">ইমেইল:</span> uao_puthia@dae.gov.bd</p>
             </div>
          </div>
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#004D40] block mb-1">বিবরণ:</span> 
               পুঠিয়া উপজেলার সামগ্রিক কৃষি উন্নয়ন, সরকারি প্রণোদনা (সার-বীজ বিতরণ) এবং যেকোনো বড় ধরনের ফসলহানি বা দুর্যোগে প্রধান সমন্বয়কারী হিসেবে দায়িত্ব পালন করেন।
             </p>
          </div>
          <button 
            onClick={() => onSimulateCall('01700-000000', 'উপজেলা কৃষি অফিসার')}
            className="text-sm font-bold text-white mt-5 flex items-center justify-center gap-2 w-full bg-[#4CAF50] hover:bg-[#388E3C] px-5 py-3.5 rounded-xl shadow-sm transition"
          >
            📞 সরাসরি কল করুন
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition hover:border-[#004D40]/20">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#4CAF50] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#A5D6A7]">
               🌾
            </div>
            <div>
              <h4 className="font-serif font-black text-[#004D40] text-xl leading-tight mb-1">উপ-সহকারী কৃষি কর্মকর্তা (SAAO) — বানেশ্বর ব্লক</h4>
              <p className="text-sm text-[#4CAF50] font-bold mt-1">ইউনিয়ন উপ-সহকারী কৃষি কর্মকর্তা (Field Level)</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">💼</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#004D40]">পদবি:</span> উপ-সহকারী কৃষি কর্মকর্তা, কৃষি সম্প্রসারণ অধিদপ্তর।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#004D40]">কর্মক্ষেত্র:</span> বানেশ্বর ইউনিয়ন (বানেশ্বর হাট ও আশেপাশের এলাকা), পুঠিয়া।</p>
             </div>
          </div>
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#004D40] block mb-1">বিবরণ:</span> 
               বানেশ্বর ব্লকের মাঠপর্যায়ের কৃষকদের সরাসরি যেকোনো ফসলের রোগবালাই, পোকা দমন এবং আধুনিক চাষাবাদের ফ্রি পরামর্শ ও সরকারি উঠান বৈঠক পরিচালনা করেন।
             </p>
          </div>
          <button 
            onClick={() => onSimulateCall('01700-000000', 'উপ-সহকারী কৃষি কর্মকর্তা')}
            className="text-sm font-bold text-[#004D40] mt-5 flex items-center justify-center gap-2 w-full bg-[#E8F5E9] hover:bg-[#C8E6C9] px-5 py-3.5 rounded-xl shadow-sm transition"
          >
            📞 উপ-সহকারীকে কল দিন
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition hover:border-[#004D40]/20">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#4CAF50] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#A5D6A7]">
               🏥
            </div>
            <div>
              <h4 className="font-serif font-black text-[#004D40] text-xl leading-tight mb-1">সহকারী উদ্ভিদ সংরক্ষণ কর্মকর্তা (ASPO)</h4>
              <p className="text-sm text-[#4CAF50] font-bold mt-1">উদ্ভিদ সংরক্ষণ ও বালাই বিশেষজ্ঞ</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">💼</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#004D40]">পদবি:</span> উদ্ভিদ সংরক্ষণ শাখা, পুঠিয়া উপজেলা।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#004D40]">অফিস লোকেশন:</span> উপজেলা কৃষি অফিস, পুঠিয়া।</p>
             </div>
          </div>
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#004D40] block mb-1">বিবরণ:</span> 
               পুঠিয়ার আম বাগান এবং বিভিন্ন ফসলের মহামারী আকার ধারণ করা পোকা-মাকড় বা ছত্রাকজনিত রোগ নিখুঁতভাবে পরীক্ষা করে সঠিক কীটনাশকের অনুমোদন ও ব্যবস্থাপনার দায়িত্ব পালন করেন।
             </p>
          </div>
          <button 
            onClick={() => onSimulateCall('01700-000000', 'সহকারী উদ্ভিদ সংরক্ষণ কর্মকর্তা')}
            className="text-sm font-bold text-white mt-5 flex items-center justify-center gap-2 w-full bg-[#4CAF50] hover:bg-[#388E3C] px-5 py-3.5 rounded-xl shadow-sm transition"
          >
            📞 জরুরি পরামর্শের জন্য কল
          </button>
        </div>

      </div>
    </div>
  );
};

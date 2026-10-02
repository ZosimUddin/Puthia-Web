import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowLeft, Phone, Globe, Camera, Edit3, Search } from "lucide-react";

export function CitizenComplaintInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("tab1");

  const [showForm, setShowForm] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!complaintText) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "complaints"), {
        details: complaintText,
        createdAt: serverTimestamp()
      });
      setShowToast(true);
      setComplaintText("");
      setTimeout(() => { setShowToast(false); setShowForm(false); }, 3000);
    } catch(err) {
      console.error(err);
      alert("Failed to submit complaint.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">আইনি ও সামাজিক অধিকার</p>
          <h1 className="text-4xl font-black mb-3 text-white">নাগরিক অভিযোগ</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             সামাজিক অনিয়ম, ভোক্তা অধিকার ক্ষুণ্ন হওয়া বা যেকোনো নাগরিক সমস্যার বিরুদ্ধে সরাসরি অভিযোগ বা আইনি গাইডলাইন।
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
          <span className="text-2xl">⚖️</span> নতুন অভিযোগ
        </button>
        <button 
          onClick={() => setActiveTab('tab2')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab2' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📜</span> ভোক্তা অধিকার
        </button>
        <button 
          onClick={() => setActiveTab('tab3')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab3' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🏛️</span> আইনি সহায়তা
        </button>
        <button 
          onClick={() => setActiveTab('tab4')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab4' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📞</span> জরুরি হেল্পলাইন
        </button>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#4A148C]"></div>
          <div className="flex gap-4 items-start pl-2">
            <div className="w-16 h-16 rounded-full bg-[#4A148C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#4A148C]/20">
               👥
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">সাধারণ নাগরিক অভিযোগ ফর্ম</h4>
            </div>
          </div>
          
          <div className="mt-4 bg-[bg-purple-50] p-4 rounded-2xl border border-purple-100 ml-2">
             <p className="text-sm text-gray-700 font-sans leading-relaxed">
               <span className="font-bold text-[#4A148C] block mb-1">📝 বিবরণ:</span> 
               যেকোনো অনিয়ম বা সামাজিক সমস্যা নিয়ে লিখিত অভিযোগ জমা দিন। আপনার নাম ও পরিচয় সম্পূর্ণ গোপন রাখা হবে।
             </p>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-5 pl-2">
            {!showForm ? (
            <button 
              onClick={() => setShowForm(true)}
              className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#4A148C] hover:bg-[#7B1FA2] px-4 py-3.5 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <Globe className="w-4 h-4" /> অনলাইন অভিযোগ ফর্ম
            </button>
            ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 relative mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
              {showToast && <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-md animate-pulse z-10">Success! ✅</div>}
              <textarea placeholder="আপনার অভিযোগ বিস্তারিত লিখুন..." value={complaintText || ""} onChange={e => setComplaintText(e.target.value)} required className="w-full text-sm p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 min-h-[100px]"></textarea>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="w-1/3 py-2 text-xs font-bold text-gray-600 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors">বাতিল</button>
                <button type="submit" disabled={isSubmitting} className="w-2/3 py-2 text-xs font-bold text-white bg-[#4A148C] rounded-xl hover:bg-[#7B1FA2] transition-colors shadow-md">জমা দিন</button>
              </div>
            </form>
            )}
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#4A148C]"></div>
          <div className="flex gap-4 items-start pl-2">
            <div className="w-16 h-16 rounded-full bg-[#4A148C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#4A148C]/20">
               ⚖️
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">জাতীয় ভোক্তা-অধিকার সংরক্ষণ</h4>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 ml-2">
             <p className="text-sm text-gray-700 font-sans leading-relaxed">
               <span className="font-bold text-gray-900 block mb-1">📝 বিবরণ:</span> 
               পুঠিয়া উপজেলার যেকোনো বাজারে পণ্যের অতিরিক্ত দাম বা ভেজাল পণ্য দিলে সরাসরি অভিযোগ করার সরকারি গাইডলাইন।
             </p>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-5 pl-2">
            <button 
              onClick={() => onSimulateAction('Calling consumer rights hotline')}
              className="text-sm font-bold text-[#4A148C] flex items-center justify-center gap-2 w-full bg-[#4A148C]/10 hover:bg-[#4A148C]/20 border border-[#4A148C]/20 px-4 py-3.5 rounded-xl transition"
            >
              <Phone className="w-4 h-4" /> ভোক্তা অধিকারে অভিযোগ
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

import React, { useState } from "react";
import { ArrowLeft, Phone, MapPin, CheckCircle } from "lucide-react";

export function SearchBloodGroupInfo({ 
  onGoBack,
  bloodDonors 
}: { 
  onGoBack: () => void;
  bloodDonors: any[];
}) {
  const [activeGroup, setActiveGroup] = useState("A+");
  const [selectedArea, setSelectedArea] = useState("all");

  const bloodGroups = ["A+", "O+", "B+", "AB+", "A-", "O-", "B-", "AB-"];

  // Normalize unions for robust searching
  const filteredDonors = bloodDonors.filter(donor => {
    const matchGroup = donor.group === activeGroup;
    
    if (selectedArea === "all") {
      return matchGroup;
    }
    
    const donorUnion = (donor.union || "").toLowerCase();
    const filterText = selectedArea.toLowerCase();
    
    // Check if the union name matches or contains the filter text (works for both English and Bengali)
    return matchGroup && (
      donorUnion.includes(filterText) || 
      (filterText === "sadar" && (donorUnion.includes("সদর") || donorUnion.includes("পৌরসভা") || donorUnion.includes("sadar") || donorUnion.includes("municipality"))) ||
      (filterText === "baneswar" && (donorUnion.includes("বানেশ্বর") || donorUnion.includes("baneswar"))) ||
      (filterText === "jiupara" && (donorUnion.includes("জিউপাড়া") || donorUnion.includes("জিউপাড়া") || donorUnion.includes("jiupara"))) ||
      (filterText === "shilmaria" && (donorUnion.includes("শিলমাড়িয়া") || donorUnion.includes("শিলমাড়িয়া") || donorUnion.includes("শিলমাড়ী") || donorUnion.includes("shilmaria"))) ||
      (filterText === "bhalukgachi" && (donorUnion.includes("ভালুকগাছী") || donorUnion.includes("ভালুকগাছী") || donorUnion.includes("bhalukgachi"))) ||
      (filterText === "jhalmalia" && (donorUnion.includes("ঝলমলিয়া") || donorUnion.includes("ঝলমলিয়া") || donorUnion.includes("jhalmalia"))) ||
      (filterText === "ponguapara" && (donorUnion.includes("পঙ্গু") || donorUnion.includes("pongu")))
    );
  });

  return (
    <div className="font-sans space-y-6 pb-6 text-left" id="search-blood-group-view">
      {/* Hero Banner Section */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #B91C1C, #EF4444)" }}
      >
        <button 
          onClick={onGoBack} 
          id="search-back-btn"
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">সহজে ও দ্রুত ডোনার খুঁজুন</p>
          <h1 className="text-3xl font-black mb-3 text-white">রক্তের গ্রুপ অনুসন্ধান</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             আপনার কাঙ্ক্ষিত রক্তের গ্রুপ এবং পুঠিয়া উপজেলার নির্দিষ্ট এলাকা সিলেক্ট করে দ্রুত অ্যাক্টিভ রক্তদাতাদের তালিকা ফিল্টার করুন।
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Blood Group Filter Horizontal Scroll */}
      <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 pl-1 uppercase tracking-wider block">🩸 রক্তের গ্রুপ নির্বাচন করুন</label>
          <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
            {bloodGroups.map((group) => (
              <button 
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap border transition-all cursor-pointer shadow-sm ${
                  activeGroup === group 
                    ? 'bg-[#D32F2F] border-[#D32F2F] text-white scale-105' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
      </div>

      {/* Area Select Inline Dropdown */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-gray-700 whitespace-nowrap flex items-center gap-1">
            <MapPin className="w-4 h-4 text-[#D32F2F]" /> এলাকা ফিল্টার:
          </span>
          <select 
            id="area-dropdown" 
            value={selectedArea || ""}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-[#D32F2F]/15"
          >
              <option value="all">সব এলাকা (সকল ইউনিয়ন)</option>
              <option value="sadar">পুঠিয়া সদর ও পৌরসভা</option>
              <option value="baneswar">বানেশ্বর ইউনিয়ন</option>
              <option value="jiupara">জিউপাড়া ইউনিয়ন</option>
              <option value="shilmaria">শিলমাড়িয়া ইউনিয়ন</option>
              <option value="bhalukgachi">ভালুকগাছী ইউনিয়ন</option>
              <option value="jhalmalia">ঝলমলিয়া এলাকা</option>
              <option value="ponguapara">পঙ্গুয়াপাড়া এলাকা</option>
          </select>
      </div>

      {/* Main Search Results Feed */}
      <div id="search-results-container" className="space-y-4">
        <h3 className="text-md font-extrabold text-gray-800 px-1">
          সার্চ রেজাল্ট ({filteredDonors.length} জন ডোনার পাওয়া গেছে)
        </h3>
        
        {filteredDonors.length === 0 ? (
          <div className="bg-white p-12 rounded-[32px] text-center border border-gray-100 shadow-sm max-w-md mx-auto">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl animate-pulse">
                ❤️
              </div>
              <h5 className="text-lg font-black text-slate-800 mb-2">কোনো রক্তদাতা পাওয়া যায়নি</h5>
              <p className="text-gray-500 text-xs mb-6 leading-relaxed">দুঃখিত ভাই, আপনার নির্বাচিত ফিল্টার বা খোঁজা রক্তের গ্রুপ অনুযায়ী কোনো রক্তদাতা পাওয়া যায়নি। অন্য রক্তের গ্রুপ বা এলাকা খুঁজে দেখুন ভাই।</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setActiveGroup("A+");
                    setSelectedArea("all");
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-full transition-all cursor-pointer"
                >
                  ফিল্টার রিসেট করুন
                </button>
              </div>
          </div>
        ) : (
          filteredDonors.map((donor, index) => (
            <div key={donor.id || index} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                      <div className="bg-red-50 text-[#D32F2F] w-12 h-12 rounded-full flex items-center justify-center text-md font-black shadow-inner border border-red-100">
                        {donor.group}
                      </div>
                      <div>
                          <h4 className="text-base font-bold text-gray-800 leading-tight">{donor.name}</h4>
                          <p className="text-xs font-semibold text-gray-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> {donor.union}
                          </p>
                      </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5 fill-current text-white" /> রক্তদানে প্রস্তুত
                  </span>
                </div>
                
                <div className="flex gap-4 text-xs font-bold text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 justify-between items-center">
                    <span>🕒 শেষ রক্তদান:</span>
                    <span className="text-gray-700">{donor.lastDonated || "১ম বার রক্তদান"}</span>
                </div>

                <a 
                  href={`tel:${donor.phone}`} 
                  id={`call-donor-${index}`}
                  className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-center py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                >
                    <Phone className="w-4 h-4 fill-current" /> সরাসরি কল করুন ({donor.phone})
                </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

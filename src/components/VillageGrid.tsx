import React, { useState, useMemo } from "react";
import { 
  ArrowLeft, Search, List, BarChart3, MapPin, Users, 
  GraduationCap, Briefcase, Sparkles, Filter, Info, ChevronRight, X
} from "lucide-react";
import { VILLAGES_DATABASE, villageSectionData, Village } from "../data/villageData";

interface VillageGridProps {
  onGoBack: () => void;
}

export function VillageGrid({ onGoBack }: VillageGridProps) {
  const [activeTab, setActiveTab] = useState<"list" | "search" | "info">("list");
  
  // Filter for 'list' tab
  const [selectedUnionId, setSelectedUnionId] = useState<string>("all");
  
  // Search inputs
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);

  const unionsList = [
    { id: "all", name: "সকল ইউনিয়ন" },
    { id: "puthia_sadar", name: "১নং পুঠিয়া সদর" },
    { id: "belpukur", name: "২নং বেলপুকুর" },
    { id: "baneshwar", name: "৩নং বানেশ্বর" },
    { id: "bhalukgachi", name: "৪নং ভালুকগাছী" },
    { id: "shilmaria", name: "৫নং শিলমাড়িয়া" },
    { id: "jeupara", name: "৬নং জিউপাড়া" },
  ];

  // Filtered villages for "All Villages" tab
  const filteredVillages = useMemo(() => {
    if (selectedUnionId === "all") return VILLAGES_DATABASE;
    return VILLAGES_DATABASE.filter(v => v.unionId === selectedUnionId);
  }, [selectedUnionId]);

  // Autocomplete searches for "Search" tab
  const searchedVillages = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return VILLAGES_DATABASE.filter(v => 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.union.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handle click on list item
  const handleSelectVillage = (village: Village) => {
    setSelectedVillage(village);
  };

  return (
    <div className="p-4 bg-[#FAF9F6] min-h-screen font-sans space-y-6">
      
      {/* 1. Main Header Banner */}
      <div className="p-6 rounded-[24px] text-white shadow-lg relative overflow-hidden bg-gradient-to-br from-[#1D4ED8] to-[#1E3A8A]">
        <div className="absolute right-0 bottom-0 w-32 h-32 text-white/5 -mb-4 -mr-4">
          <MapPin className="w-full h-full" />
        </div>
        <div className="relative z-10">
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-block mb-3 border border-white/20">
            গ্রাম তথ্যভাণ্ডার
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight leading-tight">
            আমাদের গ্রাম ডিরেক্টরি
          </h2>
          <p className="text-xs sm:text-sm text-neutral-200/90 max-w-2xl leading-relaxed text-justify">
            পুঠিয়া উপজেলার ৬টি ইউনিয়নের ১২৮টি গ্রামের জনসংখ্যা, শিক্ষার হার, প্রধান অর্থনৈতিক পেশা ও স্থানীয় ঐতিহাসিক গুরুত্বের সম্পূর্ণ ডিজিটাল তথ্যভাণ্ডার।
          </p>
          
          <div className="mt-5">
            <button 
              onClick={onGoBack}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20 transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
              <span>ফিরে যান</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub Navigation Tabs */}
      <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 4px", marginBottom: "20px" }}>
        {[
          { id: "list", label: "ইউনিয়নভিত্তিক তালিকা", emoji: "📋" },
          { id: "search", label: "তাত্ক্ষণিক অনুসন্ধান", emoji: "🔍" },
          { id: "info", label: "গ্রামীণ পরিসংখ্যান", emoji: "📊" }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedVillage(null);
                setSearchQuery("");
              }}
              style={{ 
                flex: 1, 
                minWidth: 0, 
                background: isActive ? "#eff6ff" : "#ffffff", 
                color: isActive ? "#1e3a8a" : "#1e293b", 
                border: isActive ? "1.5px solid #3b82f6" : "1px solid #e2e8f0", 
                padding: "10px 2px", 
                borderRadius: "16px", 
                textAlign: "center", 
                cursor: "pointer", 
                transition: "all 0.2s" 
              }}
              className="hover:border-blue-400 hover:shadow-sm flex flex-col items-center justify-center group"
            >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isActive ? 'bg-blue-100' : 'bg-gray-50'} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                  <span className={`text-sm sm:text-base ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
                </div>
                <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{tab.label}</div>
            </div>
          );
        })}
      </div>

      {/* 3. Panel Content */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-6 min-h-[350px]">
        
        {/* PANEL A: UNION-BASED LIST */}
        {activeTab === "list" && (
          <div className="space-y-6">
            {/* Filter Pills */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> ইউনিয়ন ফিল্টার করুন
              </span>
              <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-2 px-2 relative">
                {unionsList.map((union) => (
                  <button
                    key={union.id}
                    onClick={() => setSelectedUnionId(union.id)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-[13px] font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                      selectedUnionId === union.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-blue-200 hover:bg-blue-50/50"
                    }`}
                  >
                    {selectedUnionId === union.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    {union.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Villages */}
            <div className="border-t border-neutral-100 pt-5 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredVillages.map((village, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectVillage(village)}
                    className="bg-white hover:bg-neutral-50/50 border border-neutral-100 hover:border-blue-200 rounded-xl p-4 transition-all duration-200 cursor-pointer flex justify-between items-center group shadow-xs hover:shadow-xs"
                  >
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-neutral-800 text-sm group-hover:text-blue-700 transition-colors">
                        {village.name}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-semibold">{village.union}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL B: SEARCH & AUTOCOMPLETE */}
        {activeTab === "search" && (
          <div className="space-y-5">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="গ্রামের নাম অথবা ইউনিয়ন লিখে খুঁজুন (উদা: দিঘলকান্দি)..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-11 py-3 border border-neutral-200 focus:border-[#1D4ED8] bg-neutral-50/40 focus:bg-white text-neutral-800 placeholder-neutral-400 rounded-xl outline-none transition-all text-xs font-bold"
              />
              <Search className="w-4.5 h-4.5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results */}
            <div>
              {searchQuery.trim() === "" ? (
                <div className="text-center py-12 text-neutral-400 border border-dashed border-neutral-100 rounded-xl">
                  <Search className="w-10 h-10 mx-auto mb-2.5 opacity-20" />
                  <p className="text-xs font-semibold">অনুসন্ধান করতে উপরে টাইপ করুন।</p>
                  <p className="text-[10px] text-neutral-400 mt-1">পুঠিয়া উপজেলার সকল নিবন্ধিত গ্রাম এই তালিকায় রয়েছে।</p>
                </div>
              ) : searchedVillages.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 border border-dashed border-neutral-100 rounded-xl">
                  <Info className="w-10 h-10 mx-auto mb-2.5 opacity-20" />
                  <p className="text-xs font-semibold text-neutral-500">আপনার অনুসন্ধান করা গ্রামটি খুঁজে পাওয়া যায়নি।</p>
                  <p className="text-[10px] text-neutral-400 mt-1">দয়া করে বানান সঠিক আছে কি না পুনরায় চেক করুন।</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#1D4ED8] bg-blue-50 border border-blue-150 px-2.5 py-1 rounded-full">
                    {searchedVillages.length}টি ফলাফল পাওয়া গেছে
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3">
                    {searchedVillages.map((village, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectVillage(village)}
                        className="bg-white hover:bg-neutral-50/50 border border-neutral-100 hover:border-blue-200 rounded-xl p-4 transition-all duration-200 cursor-pointer flex justify-between items-center group shadow-xs"
                      >
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-neutral-800 text-sm group-hover:text-blue-700 transition-colors">
                            {village.name}
                          </h4>
                          <p className="text-[10px] text-neutral-400 font-semibold">{village.union}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL C: STATISTICS & PIE METERS */}
        {activeTab === "info" && (
          <div className="space-y-6">
            <h3 className="text-[15px] font-extrabold text-[#1A1A1A] border-b border-neutral-50 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> পুঠিয়া উপজেলার গ্রামীণ পরিসংখ্যান
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              {/* Stat Card 1 */}
              <div className="bg-blue-50/50 border border-blue-100/50 p-5 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-lg">
                  🏡
                </div>
                <div>
                  <h4 className="font-bold text-neutral-500 text-[11px] uppercase tracking-wider">মোট গ্রাম সংখ্যা</h4>
                  <span className="text-xl font-black text-neutral-800 block mt-1">১২৮টি গ্রাম</span>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-normal">উপজেলার ৬টি ইউনিয়নের অন্তর্গত রাজস্ব ও নিবন্ধিত গ্রামের সংখ্যা।</p>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-emerald-50/50 border border-emerald-100/50 p-5 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-lg">
                  🎓
                </div>
                <div>
                  <h4 className="font-bold text-neutral-500 text-[11px] uppercase tracking-wider">গড় গ্রামীণ স্বাক্ষরতা</h4>
                  <span className="text-xl font-black text-neutral-800 block mt-1">৫১.৮%</span>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-normal">বানেশ্বর ও পুঠিয়া সদর ইউনিয়নে শিক্ষার হার তুলনামূলক বেশি।</p>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-amber-50/50 border border-amber-100/50 p-5 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center text-lg">
                  🚜
                </div>
                <div>
                  <h4 className="font-bold text-neutral-500 text-[11px] uppercase tracking-wider">প্রধান জীবিকা উৎস</h4>
                  <span className="text-xl font-black text-neutral-800 block mt-1">কৃষি ও আম ব্যবসা</span>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-normal">শতকরা প্রায় ৬৫% মানুষ সরাসরি আম চাষ ও ধান-সবজি ব্যবসার সাথে সম্পৃক্ত।</p>
                </div>
              </div>

            </div>

            {/* Education Progress bar visualizer */}
            <div className="border-t border-neutral-150 pt-5 space-y-4">
              <h4 className="font-bold text-neutral-800 text-xs uppercase tracking-wider">ইউনিয়ন ভিত্তিক গড় গ্রামীণ শিক্ষার চিত্র</h4>
              <div className="space-y-3">
                {[
                  { name: "৩নং বানেশ্বর ইউনিয়ন", rate: "৫৬.২%", width: "w-[56.2%]" },
                  { name: "৪নং ভালুকগাছী ইউনিয়ন", rate: "৫৩.১%", width: "w-[53.1%]" },
                  { name: "১নং পুঠিয়া সদর ইউনিয়ন", rate: "৫২.৪%", width: "w-[52.4%]" },
                  { name: "২নং বেলপুকুর ইউনিয়ন", rate: "৪৯.৮%", width: "w-[49.8%]" },
                  { name: "৬নং জিউপাড়া ইউনিয়ন", rate: "৪৮.৩%", width: "w-[48.3%]" },
                  { name: "৫নং শিলমাড়িয়া ইউনিয়ন", rate: "৪৬.৭%", width: "w-[46.7%]" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-neutral-700">
                      <span>{item.name}</span>
                      <span>{item.rate}</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div className={`bg-blue-600 h-full ${item.width} rounded-full`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. VILLAGE PROFILE DETAIL MODAL SHEETS */}
      {selectedVillage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setSelectedVillage(null)} 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
          />
          <div className="bg-white rounded-3xl w-full max-w-lg relative shadow-2xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-250 z-10 max-h-[90vh] overflow-y-auto border border-neutral-100">
            
            <button
              onClick={() => setSelectedVillage(null)}
              className="absolute top-4 right-4 p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Content */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl">
                  🏡
                </div>
                <div>
                  <span className="bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase">
                    {selectedVillage.union}
                  </span>
                  <h3 className="font-black text-neutral-800 text-[18px] mt-0.5">{selectedVillage.name}</h3>
                </div>
              </div>

              {/* Data Rows */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50/60 p-3.5 rounded-xl border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">👨‍👩‍👧‍👦 মোট জনসংখ্যা</span>
                  <span className="font-extrabold text-neutral-800 text-sm block mt-1">{selectedVillage.population}</span>
                </div>
                <div className="bg-neutral-50/60 p-3.5 rounded-xl border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">🎓 স্বাক্ষরতার হার</span>
                  <span className="font-extrabold text-neutral-800 text-sm block mt-1">{selectedVillage.literacy}</span>
                </div>
                <div className="bg-neutral-50/60 p-3.5 rounded-xl border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">👨 পুরুষ জনসংখ্যা</span>
                  <span className="font-bold text-neutral-700 text-xs block mt-1">{selectedVillage.male}</span>
                </div>
                <div className="bg-neutral-50/60 p-3.5 rounded-xl border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">👩 নারী জনসংখ্যা</span>
                  <span className="font-bold text-neutral-700 text-xs block mt-1">{selectedVillage.female}</span>
                </div>
              </div>

              {/* Detailed Descriptions */}
              <div className="space-y-4 pt-3 border-t border-neutral-100 text-xs">
                
                {/* Livelihood */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-500 text-[10px] uppercase tracking-wider">প্রধান অর্থনৈতিক জীবিকা</h5>
                    <p className="text-neutral-700 mt-1 font-semibold">{selectedVillage.livelihood}</p>
                  </div>
                </div>

                {/* Education */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-500 text-[10px] uppercase tracking-wider">গ্রামের শিক্ষা প্রতিষ্ঠান</h5>
                    <p className="text-neutral-700 mt-1 font-semibold">{selectedVillage.schools}</p>
                  </div>
                </div>

                {/* Landmarks */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-500 text-[10px] uppercase tracking-wider">প্রধান স্থাপনা ও দর্শনীয় স্থান</h5>
                    <p className="text-neutral-700 mt-1 font-semibold">{selectedVillage.landmarks}</p>
                  </div>
                </div>

              </div>

              {/* Closing controls */}
              <div className="pt-4 border-t border-neutral-100">
                <button
                  onClick={() => setSelectedVillage(null)}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-xs active:scale-95"
                >
                  বন্ধ করুন
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
